const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

// const habitablePlanets = [];

const isHabitablePlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

const loadPlanetsData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
};

const getAllPlanets = async () => {
  return await planets.find({}, { __v: 0, _id: 0 });
};

const savePlanet = async (planet) => {
  try {
    //insert + update = update
    //Below will create if it is not existing, it will update if it is already present
    return await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      {
        upsert: true,
      }
    );
  } catch (er) {
    console.error("Failed to update", er);
    return er;
  }
};

module.exports = { loadPlanetsData, getAllPlanets };
