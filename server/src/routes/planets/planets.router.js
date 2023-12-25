const express = require("express");

const { httpGetAllPlanets } = require("./planets.controller");

const planetsRouter = express.Router();

planetsRouter.use((req, res, next) => {
  //NExt is mandatory or else it would be in pending state
  next();
});

planetsRouter.get("/", httpGetAllPlanets);

module.exports = planetsRouter;
