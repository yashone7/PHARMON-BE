const express = require("express");
const _ = require("lodash");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const employeeModel = require("../../models/employeesModel");

// Validation to be carried out here
// creating updating deleting users should be carried out here

// pass in checkAdmin middleware to access protected routes

// HTTP verb - POST - registering a new employee private access
router.post(
  "/",
  [
    check("emp_name", "name is required")
      .not()
      .isEmpty(),
    check("emp_phone", "phone number is required")
      .not()
      .isEmpty(),
    check("emp_password", "password is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { emp_name, emp_phone, emp_role, emp_password } = req.body;
    try {
      // check to see if the employee exists if not then create
      let employee = await employeeModel.findOne({ emp_phone });
      if (employee) {
        return res
          .status(400)
          .json({ errors: [{ msg: "employee already exists" }] });
      }
      employee = new employeeModel({
        emp_name,
        emp_phone,
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

module.exports = router;
