const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const _ = require("lodash");
const auth = require("../../middleware/auth");
const checkAdmin = require("../../middleware/checkAdmin");
const docModel = require("../../models/doctorsModel");

// validation to be carried out here
// creating updating deleting users should be carried out here

// custom validaton middleware for location of doctor
function checkLocationSchema(req, res, next) {
  const { type, coordinates } = req.body.doc_clinic_location;
  const locCoordinates = _.flattenDeep(coordinates);
  // to check for empty elements in nested array first flatten it and then check
  if (_.isEmpty(type) || _.isEmpty(locCoordinates)) {
    return res.status(400).send("please enter location data");
  }
  next();
}

// HTTP verb - POST - registering a new doctor private access
router.post(
  "/",
  [
    auth,
    checkAdmin,
    [
      check("doc_name", "name is required")
        .not()
        .isEmpty(),
      check("doc_type", "type of doctor is required")
        .not()
        .isEmpty(),
      check("doc_specialisation", "specialisation is required")
        .not()
        .isEmpty(),
      check("doc_phone", "phone number is required")
        .not()
        .isEmpty()
    ],
    checkLocationSchema
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      doc_name,
      doc_type,
      doc_phone,
      doc_specialisation,
      doc_qualification,
      doc_clinic_location
    } = req.body;
    try {
      // check to see if the doctor exists if not then create
      let doctor = await docModel.findOne({ doc_phone });
      if (doctor) {
        return res
          .status(400)
          .json({ errors: [{ msg: "doctor already exists" }] });
      }
      doctor = new docModel({
        doc_name,
        doc_type,
        doc_phone,
        doc_specialisation,
        doc_qualification,
        doc_clinic_location
      });

      await doctor.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }

    res.send(req.body);
  }
);

router.get("/", [auth], async (req, res) => {
  const doctors = await docModel.find();
  res.send(doctors);
});

router.get("/:id", [auth], async (req, res) => {
  const doctor = await docModel.findById({ _id: req.params.id });
  if (!doctor) return res.json({ msg: "doctor with given id does not exist" });
  res.send(doctor);
});

router.delete("/:id", [[auth, checkAdmin]], async (req, res) => {
  const doctor = await docModel.findByIdAndDelete({ _id: req.params.id });
  if (!doctor) return res.json({ msg: "doctor with given id does not exist" });
  res.status(200).send("doctor removed...");
});

// updating a doctor with given id
router.patch("/:id", [auth, checkAdmin], async (req, res) => {
  const update = {};
  _.assign(update, req.body);
  docModel
    .updateOne({ _id: req.params.id }, { $set: update })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => console.error(err.message));
});

module.exports = router;
