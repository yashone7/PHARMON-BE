const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { check, validationResult } = require("express-validator");
const workRecordModel = require("../../models/workRecordModel");
const auth = require("../../middleware/auth");
// here we write the logic for recording the work record of the employee

// custom middleware to check location
function checkLocationAndProducts(req, res, next) {
  const { doc_location, products } = req.body;
  const { type, coordinates } = doc_location;
  const locCoordinates = _.flattenDeep(coordinates);
  if (_.isEmpty(type) || _.isEmpty(locCoordinates) || _.isEmpty(products)) {
    return res.status(400).json({
      message: `type: ${type}, coordinates: ${locCoordinates}, products: ${products} cannot be empty`
    });
  }
  next();
}

router.post(
  "/:id",
  [
    auth,
    checkLocationAndProducts,
    [
      check("doc_id", "doctor id is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //we will pass doctor id and employee id as query headers.
    const { doc_id } = req.body;
    try {
      let workRecord = await workRecordModel.findOne({ emp_id: req.params.id });
      workRecord = new workRecordModel({
        doc_id,
        emp_id: req.params.id,
        doc_location: req.body.doc_location,
        products: req.body.products
      });
      await workRecord.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

module.exports = router;
