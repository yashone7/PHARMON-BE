const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const productModel = require("../../models/productModel");

// Route for creating a product
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

// Route for updating a product
router.patch("/:id", [], async (req, res) => {
  const update = {};
  _.assign(update, req.body);
  productModel
    .updateOne({ _id: req.params.id }, { $set: update })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => console.error(err.message));
});

// Getting product all products
router.get("/", async (req, res) => {
  const products = await productModel.find().select("-__v");
  if (!products) {
    return res.status(404).send("No products exist");
  }
  res.send(products);
});

// Getting product by id
router.get("/:id", async (req, res) => {
  const product = await productModel.findById(req.params.id).select("-__v");
  if (!product) {
    return res.status(404).send("The product with given id doesn not exist");
  }
  res.send(product);
});

// deleting a product
router.delete("/:id", async (req, res) => {
  const product = await productModel.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(400).send("The product with given id does not exist");
  }
  res.status(200).send("product deleted");
});

module.exports = router;
