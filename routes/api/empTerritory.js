const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { check, validationResult } = require("express-validator");
const territoryModel = require("../../models/territoryModel");
const auth = require("../../middleware/auth");

// custom middleware to check location and territory details of employee
function checkTerritoryDetails(req, res, next) {
  for (let record of req.body.territory) {
    let { doc_id, doc_location } = record;
    let { type, coordinates } = doc_location;
    let coords = _.flatMapDeep(coordinates);
    if (_.isEmpty(doc_id) || _.isEmpty(type) || _.isEmpty(coords)) {
      return res
        .status(400)
        .send("Please enter territory details of all records");
    }
  }
  next();
}

// this route is used for posting employee territory
router.post(
  "/",
  [
    auth,
    checkTerritoryDetails,
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
    try {
      let territory = await territoryModel.findOne({ emp_id: req.body.emp_id });
      territory = new territoryModel({
        emp_id: req.body.emp_id,
        territory: req.body.territory[0]
      });
      //await territory.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

module.exports = router;
