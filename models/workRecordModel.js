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

const workRecordSchema = mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employeeModel",
    required: true
  },
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "docModel"
  },
  doc_location: {
    type: multiPointSchema,
    required: true
  },
  products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "productModel",
    required: true
  }
});

const workRecordModel = new mongoose.model("workRecordModel", workRecordSchema);
module.exports = workRecordModel;
