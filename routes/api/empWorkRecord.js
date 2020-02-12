const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { check, validationResult } = require("express-validator");
const workRecordModel = require("../../models/workRecordModel");
// here we write the logic for recording the work record of the employee

// custom middleware to check location
function checkLocation(req, res, next) {
  for (let record of req.body.workSummary) {
    const { doc_id, doc_location, products } = record;
    const { type, coordinates } = doc_location;
    const coords = _.flattenDeep(coordinates);
    for (let product of products) {
      const { product_id } = product;
      if (
        _.isEmpty(doc_id) ||
        _.isEmpty(type) ||
        _.isEmpty(coords) ||
        _.isEmpty(product_id)
      ) {
        return res.status(400).send("please enter work summary of all records");
      }
    }
  }
  next();
}

router.post(
  "/",
  [
    checkLocation,
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
    const { emp_id } = req.body;
    try {
      let workSummary = await workRecordModel.findOneAndUpdate(
        { emp_id },
        { new: true }
      );
      workSummary = new workRecordModel({
        emp_id,
        workSummary: req.body.workSummary[0]
      });
      await workSummary.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

module.exports = router;
