const mongoose = require("mongoose");

let multiPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MultiPoint"],
    required: true
  },
  coordinates: {
    type: [[Number]],
    required: true
  }
});

let chemSchema = new mongoose.Schema({
  chem_name: {
    type: String,
    required: true
  },
  chem_phone: {
    type: String,
    required: true
  },
  chem_contact: {
    type: {
      Address: String,
      Email: String
    },
    required: true
  },
  chem_location: {
    type: multiPointSchema,
    required: true
  }
});

const chemModel = mongoose.model("chemModel", chemSchema);

module.exports = chemModel;
