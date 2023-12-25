const mongoose = require("mongoose");

const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

//Always use singular, mongoose automatically converts to plural
module.exports = mongoose.model("Planet", planetSchema);
