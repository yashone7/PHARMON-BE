const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const _ = require("lodash");
const chemModel = require("../../models/chemistsModel");
const auth = require("../../middleware/auth");
const checkAdmin = require("../../middleware/checkAdmin");
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

// HTTP verb - POST - registering a new chemist private access
router.post(
  "/",
  [
    auth,
    checkAdmin,
    [
      check("chem_name", "name is required")
        .not()
        .isEmpty(),
      check("chem_phone", "phone number is required")
        .not()
        .isEmpty(),
      check("chem_contact", "contact is required")
        .not()
        .isEmpty()
    ]
  ],
  checkLocationSchema,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { chem_name, chem_contact, chem_phone, chem_location } = req.body;
    try {
      // check to see if the chemist exists if not then create
      let chemist = await chemModel.findOne({ chem_phone });
      if (chemist) {
        return res
          .status(400)
          .json({ errors: [{ msg: "chemist already exists" }] });
      }
      chemist = new chemModel({
        chem_name,
        chem_contact,
        chem_phone,
        chem_location
      });

      await chemist.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

router.get("/", [auth], async (req, res) => {
  const chemist = await chemModel.find().select("-__v");
  res.send(chemist);
});

router.get("/:id", async (req, res) => {
  const chemist = await chemModel.findById(req.params.id);
  if (!chemist) {
    res.status(404).send("The chemist with the gicen id does not exist");
  }
  res.send(chemist);
});

// update operation
router.patch("/:id", [auth, checkAdmin], async (req, res) => {
  const update = {};
  _.assign(update, req.body);
  chemModel
    .updateOne({ _id: req.params.id }, { $set: update })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => console.error(err.message));
});

router.delete("/:id", [auth, checkAdmin], async (req, res) => {
  const chemist = await chemModel.findByIdAndDelete(req.params.id);
  if (!chemist) {
    return res.status(400).send("The chemist with given id does not exist");
  }
  res.status(200).send("chemist deleted");
});

module.exports = router;
