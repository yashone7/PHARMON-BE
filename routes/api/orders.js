const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const orderModel = require("../../models/orderModel");
const auth = require("../../middleware/auth");
const jwt = require('jsonwebtoken');
const { parseISO } = require('date-fns')


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
    const employee = jwt.decode(req.headers['x-auth-token'])
    if (req.params.id !== employee.user.id) {
      return res.status(406).send("Cannot create order for different employee")
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
  try {
    const orders = await orderModel
      .find()
      .select("-__v")
      .populate("emp_id", "-emp_password -emp_role -__v -emp_phone")
      .populate("product_id", "-__v")
      .populate("chem_id", "chem_name chem_location");
    res.send(orders);
  } catch (err) {
    console.error(err.message)
    res.status(500).send("server error")
  }
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

// Route to find orders by chem id
router.get("/chemists/:id", [auth], async (req, res) => {
  const orders = await orderModel
    .find({ chem_id: req.params.id })
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


// Route for getting all orders sorted by given dates
router.get("/", [auth], async (req, res) => {
  const { startDate, endDate } = req.query
  try {
    const orders = await orderModel
      .find().where('order_date').gt(parseISO(startDate)).lt(parseISO(endDate))
      .select("-__v")
      .populate({ path: "emp_id", select: "-emp_password -emp_role -__v -emp_phone" })
      .populate("product_id", "-__v")
      .populate("chem_id", "chem_name chem_location");
    res.send(orders);
  } catch (err) {
    console.error(err.message).send('Something went wrong')
  }
});

// Route for getting all sale of chemists between 2 given dates
// leaderboard - done | top selling chemist - done | sale today + sale this month - query with respective dates and reduce
// the result  
// Better implementation is down below
// router.get("/test/chemists/orderBy=chemist", [auth], async (req, res) => {
//   const { startDate, endDate } = req.query
//   try {
//     const orders = await orderModel.aggregate([
//       { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
//       { $lookup: { from: "chemmodels", localField: "chem_id", foreignField: "_id", as: "chemist" } },
//       { $unwind: "$chemist" },
//       {
//         $group: {
//           _id: { id: "$chemist._id", name: "$chemist.chem_name", location: "$chemist.chem_location" },
//           totalSale: { $sum: "$product_sale" }
//         }
//       }//,
//       //{ $project: { chem_id: 1, totalSale: 1, chemist: 1 } }, meaningless
//     ])
//     res.send(orders);
//   } catch (err) {
//     console.error(err.message)
//     res.status(500).send('server error')
//   }
// });

router.get("/employees", [auth], async (req, res) => {
  const { startDate, endDate, orderBy } = req.query
  if (orderBy === 'none') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $lookup: { from: "employeemodels", localField: "emp_id", foreignField: "_id", as: "employee" } },
        { $unwind: "$employee" },
        {
          $group: {
            _id: { emp_id: "$employee._id", name: "$employee.emp_name" },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }
  if (orderBy === 'date') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $project: { day: { $dayOfMonth: "$order_date" }, emp_id: 1, product_sale: 1 } },
        { $lookup: { from: "employeemodels", localField: "emp_id", foreignField: "_id", as: "employee" } },
        { $unwind: "$employee" },
        {
          $group: {
            _id: { emp_id: "$employee._id", name: "$employee.emp_name", day: "$day" },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }
  if (orderBy === 'product') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $project: { product_id: 1, emp_id: 1, product_sale: 1 } },
        { $lookup: { from: "employeemodels", localField: "emp_id", foreignField: "_id", as: "employee" } },
        { $unwind: "$employee" },
        { $lookup: { from: "productmodels", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        {
          $group: {
            _id: {
              emp_id: "$employee._id", product_id: "$product._id", name: "$employee.emp_name",
              product_name: "$product.product_name"
            },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }
  if (orderBy === 'chemist') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $project: { chem_id: 1, emp_id: 1, product_sale: 1 } },
        { $lookup: { from: "employeemodels", localField: "emp_id", foreignField: "_id", as: "employee" } },
        { $unwind: "$employee" },
        { $lookup: { from: "chemmodels", localField: "chem_id", foreignField: "_id", as: "chemist" } },
        { $unwind: "$chemist" },
        {
          $group: {
            _id: {
              emp_id: "$employee._id", chem_id: "$chemist._id", name: "$employee.emp_name",
              chem_name: "$chemist.chem_name"
            },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  } else return res.status(405).send("Invalid request")
});

router.get("/products", [auth], async (req, res) => {
  const { startDate, endDate, orderBy } = req.query
  // product sale vs chemist
  if (orderBy === 'chemist') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $lookup: { from: "productmodels", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        {
          $group: {
            _id: { id: "$product._id", name: "$product.product_name", chem_id: "$chem_id" },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }
  // orderBy - date product sale vs date
  if (orderBy === 'date') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $project: { day: { $dayOfMonth: "$order_date" }, product_id: 1, product_sale: 1 } },
        { $lookup: { from: "productmodels", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        {
          $group: {
            _id: { id: "$product._id", name: "$product.product_name", day: "$day" },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }
  // product sale
  if (orderBy === 'none') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $lookup: { from: "productmodels", localField: "product_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        {
          $group: {
            _id: { id: "$product._id", name: "$product.product_name" },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  } else return res.status(405).send("Invalid request")
});


router.get("/chemists", [auth], async (req, res) => {
  const { startDate, endDate, orderBy } = req.query
  if (orderBy === 'date') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $project: { day: { $dayOfMonth: "$order_date" }, chem_id: 1, product_sale: 1 } },
        { $lookup: { from: "chemmodels", localField: "chem_id", foreignField: "_id", as: "chemist" } },
        { $unwind: "$chemist" },
        {
          $group: {
            _id: {
              order_id: "$_id",
              /*id: "$chemist._id", name: "$chemist.chem_name", location: "$chemist.chem_location",*/
              day: "$day"
            },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }

  if (orderBy === 'chemist') {
    try {
      const orders = await orderModel.aggregate([
        { $match: { order_date: { $gt: parseISO(startDate), $lt: parseISO(endDate) } } },
        { $lookup: { from: "chemmodels", localField: "chem_id", foreignField: "_id", as: "chemist" } },
        { $unwind: "$chemist" },
        {
          $group: {
            _id: { chem_id: "$chemist._id", name: "$chemist.chem_name", location: "$chemist.chem_location" },
            totalSale: { $sum: "$product_sale" }
          }
        }
      ])
      return res.send(orders);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  } else return res.status(405).send("Invalid request")
})

module.exports = router;