const request = require("supertest");

const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API", () => {
  //Executes in the beginning
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });
  // Executes at the last
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app).get("/v1/launches");
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "test mission",
      rocket: "test rocket",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const completeLaunchDataWithoutDate = {
      mission: "test mission",
      rocket: "test rocket",
      target: "Kepler-62 f",
    };

    const launcDataWithInvalidDate = {
      mission: "test mission",
      rocket: "test rocket",
      target: "Kepler-62 f",
      launchDate: "Invalid",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(completeLaunchDataWithoutDate);
    });

    test("It should catch missing properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required properties",
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launcDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid Date",
      });
    });
  });
});
