const mongoose = require("mongoose");

let employeeSchema = new mongoose.Schema({
  emp_name: {
    type: String,
    required: true
  },
  emp_phone: {
    type: Number,
    required: true,
    unique: true
  },
  emp_password: {
    type: String,
    required: true
  },
  emp_role: {
    type: String,
    enum: ["admin", "msr"],
    default: "msr",
    required: true
  },
  /*sale is not marked required because employee is created by admin the sale details are updated by employee
  when he hits different end point, here it gets updated*/
  emp_sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "saleRecordModel"
  }
});

const employeeModel = mongoose.model("employeeModel", employeeSchema);

module.exports = employeeModel;
