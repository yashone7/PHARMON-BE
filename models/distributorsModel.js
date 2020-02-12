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

let distSaleSchema = new mongoose.Schema({
  type: {
    month: String,
    sale: Number
  }
});

let distSchema = new mongoose.Schema({
  dist_name: {
    type: String,
    required: true
  },
  dist_phone: {
    type: String,
    required: true
  },
  dist_contact: {
    type: {
      Address: String,
      Email: String
    },
    required: true
  },
  dist_sale: [distSaleSchema],
  dist_location: {
    type: multiPointSchema,
    required: true
  }
});

const distModel = mongoose.model("distModel", distSchema);

module.exports = distModel;
