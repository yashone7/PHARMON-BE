const mongoose = require("mongoose");

let adminSchema = mongoose.Schema({
  admin_name: {
    type: String,
    required: true
  },
  admin_password: {
    type: String,
    required: true
  },
  admin_email: {
    type: String,
    unique: true,
    required: true
  }
});

let adminModel = mongoose.model("adminModel", adminSchema);

module.exports = adminModel;
