const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const productModel = require("../../models/productModel");

router.post(
  "/",
  [
    check("product_name", "product name is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { product_name } = req.body;
    try {
      let product = await productModel.findOne({ product_name });
      if (product) {
        return res
          .status(400)
          .json({ errors: [{ msg: "product already exists" }] });
      }
      product = new productModel({ product_name });
      await product.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

module.exports = router;
