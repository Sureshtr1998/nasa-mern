const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const api = require("./routes/api");
const app = express();

// app.use((req, res, next) => {
//   next();
// });

app.use(cors({ origin: "http://localhost:3000" }));

app.use(morgan("combined"));

app.use(express.json());

//This is going to send the build file which is inside public
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", api);
//Use * always at the bottom

app.get("/*", (req, res) => {
  // res.sendFile(path.resolve(path.resolve(), "client", "build", "index.html"));
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
