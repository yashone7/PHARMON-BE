const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const admins = require("../../models/adminModel");
const { check, validationResult } = require("express-validator");

router.post(
  "/",
  [
    check("admin_email", "email is required").exists(),
    check("admin_password", "password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { admin_email, admin_password } = req.body;
    try {
      let admin = await admins.findOne({ admin_email });
      if (!admin) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      const validPassword = await bcrypt.compare(
        admin_password,
        admin.admin_password
      );
      if (!validPassword) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      const payload = {
        user: {
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
  }
);

// Now we have created authentication logic for admin now we have to use it for protected routes

module.exports = router;
