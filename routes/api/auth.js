const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const employees = require("../../models/employeesModel");
const auth = require("../../middleware/auth");

router.post("/", async (req, res) => {
  const { emp_phone, emp_password } = req.body;
  try {
    let employee = await employees.findOne({ emp_phone });

    if (!employee) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid  Credentials" }] });
    }

    const validPassword = await bcrypt.compare(
      emp_password,
      employee.emp_password
    );

    if (!validPassword) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
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
      { expiresIn: "3h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

router.get("/", [auth], async (req, res) => {
  try {
    // console.log(req.user);
    const employee = await employees
      .findById(req.user.user.id)
      .select("-emp_password -__v");
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
