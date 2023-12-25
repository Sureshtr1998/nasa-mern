const http = require("http");
require("dotenv").config();

const app = require("./app");
const { mongoConnect } = require("../src/services/mongo");

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async () => {
  await mongoConnect();
  //while initialising if it is a stream then we have to go with this or search for stream promises for better approach
  //Here server will start once we have initialize the data
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
