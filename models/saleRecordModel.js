const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "productModel",
    required: true
  },
  product_sale: {
    type: Number,
    required: true
  }
});

const summarySchema = new mongoose.Schema({
  chem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chemModel",
    required: true
  },
  chem_sale: [saleSchema]
});

const saleRecordSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employeeModel",
    required: true
  },
  summary: [summarySchema]
});

const saleRecordModel = mongoose.model("saleRecordModel", saleRecordSchema);
module.exports = saleRecordModel;

/*

chemist will give an order so order schema

orders: {
  order_id: '',
  product_id: '',
  product_sale: '',
  chem_id: '',
  emp_id:''
  order_time: ''
}

const orderSchema = new Schema({})

*/
