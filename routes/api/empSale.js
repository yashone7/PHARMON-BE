const express = require("express");
const _ = require("lodash");
const router = express.Router();
const saleRecordModel = require("../../models/saleRecordModel");

// custom validaton middleware for checking emp_workRecord of employee
function checkWorkRecord(req, res, next) {
  const { chem_id, chem_sale } = req.body.summary[0];
  for (let record of chem_sale) {
    const { product_id, product_sale } = record;
    if (
      _.isEmpty(chem_id) ||
      _.isEmpty(product_id) ||
      !_.isNumber(product_sale)
    ) {
      return res.status(400).send("please enter work record data");
    }
  }

  next();
}
// create a post resource to create a blank resoure and then use update
// operator to patch it

// This should be a protected route
router.post("/:id", [], async (req, res) => {
  try {
    let saleRecord = await saleRecordModel.findOne({ emp_id: req.params.id });
    if (saleRecord) {
      return res.status(400).send("Sale record of employee already exists");
    }
    saleRecord = new saleRecordModel({
      emp_id: req.params.id,
      summary: []
    });
    await saleRecord.save();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
  res.send("sale record created");
});

// This route is used for updating the sale of the employees
router.patch("/:id", [checkWorkRecord], async (req, res) => {
  try {
    let saleRecord = await saleRecordModel.findOneAndUpdate(
      { emp_id: req.params.id },
      { $addToSet: { summary: req.body.summary } },
      { new: true, upsert: false }
    );
    await saleRecord.save();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
  return res.send(req.body);
});

module.exports = router;
