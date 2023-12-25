const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("Connection to DB read");
});

mongoose.connection.on("error", (err) => {
  console.error(err, "Connection to DB faileds!!!");
});

const mongoConnect = async () => {
  await mongoose.connect(MONGO_URL);
};

const mongoDisconnect = async () => {
  await mongoose.disconnect();
};

module.exports = { mongoConnect, mongoDisconnect };
