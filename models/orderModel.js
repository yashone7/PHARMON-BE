const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // order_id: {
  //   type: mongoose.Types.ObjectId
  // },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "productModel",
    required: true
  },
  product_sale: {
    type: Number,
    required: true
  },
  chem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chemModel",
    required: true
  },
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employeeModel",
    required: true
  },
  order_date: {
    type: Date
  }
});

const orderModel = new mongoose.model("orderModel", orderSchema);
module.exports = orderModel;

/* 
Product id should come from product name - implement product search
Chemist id should come from chemist name - implement chemist search 
*/
