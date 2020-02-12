const express = require("express");
const _ = require("lodash");
const router = express.Router();
const { check, validationResult } = require("express-validator");
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

// This route is used for updating the sale of the employees
router.patch(
  "/",
  [
    checkWorkRecord,
    [
      check("emp_id", "employee id is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { emp_id, summary } = req.body;
    // const sale = summary[0].chem_sale[0];
    // console.log(sale);
    // console.log(summary[0]);
    try {
      let saleRecord = await saleRecordModel.findOneAndUpdate({ emp_id });
      saleRecord = new saleRecordModel({
        emp_id: emp_id,
        summary: req.body.summary[0]
      });
      await saleRecord.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    return res.send(req.body);
  }
);

module.exports = router;
