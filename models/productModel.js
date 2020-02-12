const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true
  },
  product_type: {
    type: String
  }
});

const productModel = mongoose.model("productModel", productSchema);
module.exports = productModel;
