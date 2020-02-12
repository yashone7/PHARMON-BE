/* admin.js is for testing purpose only he can create, read, update, delete employees, doctors, 
chemists and distributors
*/

// this module is for creating new admin
// it is public but it is not exposed to client directly
const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const adminModel = require("../../models/adminModel");

// Validation to be carried out here
// creating updating deleting users should be carried out here

router.post(
  "/",
  [
    check("admin_name", "name is required")
      .not()
      .isEmpty(),
    check("admin_email", "email is rquired").isEmail(),
    check(
      "admin_password",
      "password is should be min of 6 characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { admin_name, admin_email, admin_password } = req.body;
    try {
      // check to see if the admin exists if not then create
      let admin = await adminModel.findOne({ admin_email });
      if (admin) {
        return res
          .status(400)
          .json({ errors: [{ msg: "admin already exists" }] });
      }
      admin = new adminModel({
        admin_name,
        admin_password,
        admin_email
      });

      // encrpyt password
      const salt = await bcrypt.genSalt(10);
      admin.admin_password = await bcrypt.hash(admin_password, salt);

      await admin.save();

      const payload = {
        admin: {
          id: admin.id
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
    //res.send(req.body);
  }
);

module.exports = router;
