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

let wordRecordSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employeeModel",
    required: true
  },
  workSummary: [
    {
      doc_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "docModel",
        required: true
      },
      doc_location: {
        type: multiPointSchema,
        required: true
      },
      products: [
        {
          product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productModel",
            required: true
          }
        }
      ]
    }
  ]
});

const workRecordModel = mongoose.model("workRecordModel", wordRecordSchema);
module.exports = workRecordModel;
