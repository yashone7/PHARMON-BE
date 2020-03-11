const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const orderModel = require("../../models/orderModel");
const auth = require("../../middleware/auth");

// Route for posting orders
router.post(
  "/:id",
  [
    auth,
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
    ]
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

// Route for getting all orders
router.get("/", [auth], async (req, res) => {
  const orders = await orderModel
    .find()
    .select("-__v")
    .populate("emp_id", "-emp_password -emp_role -__v -emp_phone")
    .populate("product_id", "-__v")
    .populate("chem_id", "chem_name chem_location");
  res.send(orders);
});

// Route to find orders by employee id
router.get("/employees/:id", [auth], async (req, res) => {
  console.log(req.query);
  const orders = await orderModel
    .find({ emp_id: req.params.id })
    .select("-__v")
    .populate("emp_id", "-emp_password -emp_role -__v -emp_phone")
    .populate("product_id", "-__v")
    .populate("chem_id", "chem_name chem_location");
  if (!orders) {
    return res.status(400).send("The order with given employee does not exist");
  }
  res.send(orders);
});

// Route to find orders by product id
router.get("/products/:id", [auth], async (req, res) => {
  const orders = await orderModel
    .find({ product_id: req.params.id })
    .select("-__v")
    .populate("emp_id", "-emp_password -emp_role -__v -emp_phone")
    .populate("product_id", "-__v")
    .populate("chem_id", "chem_name chem_location");
  if (!orders) {
    return res
      .status(400)
      .send("The order with the given product id does not exist");
  }
  res.send(orders);
});

module.exports = router;
