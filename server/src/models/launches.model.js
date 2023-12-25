const axios = require("axios");
const launchesDb = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHNUMBER = 100;

const SPACE_X_API_URL = "https://api.spacexdata.com/v4/launches/query";

const populateLaunches = async () => {
  const resp = await axios.post(SPACE_X_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (resp.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = resp.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
};

const loadLaunchesData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Exists in DB");
  } else {
    await populateLaunches();
  }
};

// launches.set(launch.flightNumber, launch);

const findLaunch = async (filter) => {
  return await launchesDb.findOne(filter);
};

const existingLaunchWithId = async (launchId) => {
  return await findLaunch({
    flightNumber: launchId,
  });
};

const getLatestFlightNumber = async () => {
  const latestLaunch = await launchesDb.findOne().sort("-flightNumber"); //Sorting in descending order by adding - to get latestlaunch
  return latestLaunch ? latestLaunch.flightNumber : DEFAULT_FLIGHNUMBER;
};

const getAllLaunches = async (skip, limit) => {
  return await launchesDb
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

const saveLaunch = async (launch) => {
  //It is similar to updateOne but here it wont return mongo default set data
  await launchesDb.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber, // Here it will check if the flightnumber exists, then it will update or else it wil insert
    },
    launch,
    {
      upsert: true,
    }
  );
};

const scheduleNewLaunch = async (launch) => {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet found");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["NASA", "ZTM"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
};

const abortLaunchById = async (launchId) => {
  const aborted = await launchesDb.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
};

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  existingLaunchWithId,
  abortLaunchById,
};
