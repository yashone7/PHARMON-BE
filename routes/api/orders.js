const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const orderModel = require("../../models/orderModel");

router.post(
  "/:id",
  [
    check("chem_id", "employee id is required")
      .not()
      .isEmpty(),
    check("product_id", "product id is required")
      .not()
      .isEmpty(),
    check("product_sale", "product sale is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { chem_id, product_id, product_sale, order_date } = req.body;
    try {
      const orders = new orderModel({
        chem_id,
        product_id,
        product_sale,
        emp_id: req.params.id,
        order_date
      });
      await orders.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    res.send(req.body);
  }
);

module.exports = router;
