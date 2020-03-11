const express = require("express");
const _ = require("lodash");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const employeeModel = require("../../models/employeesModel");
const auth = require("../../middleware/auth");
const checkAdmin = require("../../middleware/checkAdmin");

// pass in checkAdmin middleware to access protected routes
// HTTP verb - POST - registering a new employee private access
router.post(
  "/",
  [
    auth,
    checkAdmin,
    [
      (check("emp_name", "name is required")
        .not()
        .isEmpty(),
      check("emp_phone", "phone number is required")
        .not()
        .isEmpty()
        .isNumeric(),
      check("emp_password", "password is required")
        .not()
        .isEmpty())
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { emp_name, emp_phone, emp_role, emp_password } = req.body;
    try {
      // check to see if the employee exists if not then create
      let employee = await employeeModel.findOne({
        emp_phone: _.toNumber(emp_phone)
      });
      if (employee) {
        return res
          .status(400)
          .json({ errors: [{ msg: "employee already exists" }] });
      }
      employee = new employeeModel({
        emp_name,
        emp_phone: parseInt(emp_phone),
        emp_role,
        emp_password
      });

      const salt = await bcrypt.genSalt(10);
      employee.emp_password = await bcrypt.hash(emp_password, salt);

      await employee.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

// update operation
router.patch("/:id", [auth, checkAdmin], async (req, res) => {
  const update = {};
  _.assign(update, req.body);
  employeeModel
    .updateOne({ _id: req.params.id }, { $set: update })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => console.error(err.message));
});

router.get("/:id", [auth], async (req, res) => {
  const employee = await employeeModel.findById(req.params.id);
  if (!employee) {
    return res
      .status(404)
      .send("The employee with the given id does not exist");
  }
  res.status(200).send(employee);
});

router.get("/", [auth, checkAdmin], async (req, res) => {
  const employee = await employeeModel.find().select("-emp_password -__v");
  res.send(employee);
});

router.delete("/:id", [auth, checkAdmin], async (req, res) => {
  employeeModel
    .findOneAndDelete({ _id: req.params.id })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => console.error(err.message));
});

module.exports = router;
