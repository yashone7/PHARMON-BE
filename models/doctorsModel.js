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

let docSchema = new mongoose.Schema({
  doc_name: {
    type: String,
    required: true
  },
  doc_phone: {
    type: String,
    required: true
  },
  doc_type: {
    type: String,
    required: true
  },
  doc_qualification: {
    type: String
    // required: true
  },
  doc_specialisation: {
    type: String
    //required: true
  },
  doc_clinic_location: {
    type: multiPointSchema,
    required: true
  }
});

const docModel = mongoose.model("docModel", docSchema);

module.exports = docModel;
