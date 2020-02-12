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

const territorySchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employeeModel",
    required: true
  },
  territory: [
    {
      doc_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "docModel",
        required: true
      },
      doc_location: {
        type: {
          type: multiPointSchema,
          ref: "docModel",
          required: true
        }
      }
    }
  ]
});

const territoryModel = mongoose.model("territoryModel", territorySchema);
module.exports = territoryModel;
