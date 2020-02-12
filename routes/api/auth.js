const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const employees = require("../../models/employeesModel");

router.post(
  "/",
  [
    check("emp_phone", "phone number is required").exists(),
    check("emp_password", "password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { emp_phone, emp_password } = req.body;
    try {
      let employee = await employees.findOne({ emp_phone });

      if (!employee) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const validPassword = await bcrypt.compare(
        emp_password,
        employee.emp_password
      );

      if (!validPassword) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: employee.id,
          role: employee.emp_role
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
