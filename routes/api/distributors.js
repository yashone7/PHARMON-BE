const express = require("express");
const _ = require("lodash");
const { check, validationResult } = require("express-validator");
const distModel = require("../../models/distributorsModel");
const router = express.Router();

// Validation to be carried out here
// creating updating deleting users should be carried out here

// custom validaton middleware for location of chemist
function checkLocationSchema(req, res, next) {
  const { type, coordinates } = req.body.chem_location;
  const locCoordinates = _.flatten(coordinates);
  // to check for empty elements in nested array first flatten it and then check
  if (_.isEmpty(type) || _.isEmpty(locCoordinates)) {
    return res.status(400).send("please enter location data");
  }
  next();
}

// HTTP verb - POST - registering a new distributor private access
router.post(
  "/",
  [
    check("dist_name", "name is required")
      .not()
      .isEmpty(),
    check("dist_phone", "phone number is required")
      .not()
      .isEmpty(),
    check("dist_contact", "contact is required")
      .not()
      .isEmpty()
  ],
  checkLocationSchema,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      dist_name,
      dist_contact,
      dist_phone,
      dist_sale,
      dist_location
    } = req.body;
    try {
      // check to see if the distributor exists if not then create
      let distributor = await distModel.findOne({ dist_phone });
      if (distributor) {
        return res
          .status(400)
          .json({ errors: [{ msg: "chemist already exists" }] });
      }
      distributor = new distModel({
        dist_name,
        dist_contact,
        dist_phone,
        dist_sale,
        dist_location
      });

      await distributor.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }

    res.send(req.body);
  }
);

module.exports = router;
