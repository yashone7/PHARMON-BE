const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
// Connect to the database
connectDB();
app.use(cors());

// Initialize middleware to parse request object
app.use(express.json({ extended: true }));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Acess-Control-Allow-Headers", "*");
//   if (req.method === "OPTIONS") {
//     res.header("Acess-Control-Allow-Origin", "PUT,POST,GET,PATCH,DELETE");
//     return res.status(200).json({});
//   }
//   next();
// });
const PORT = process.env.PORT || 2000;

app.use("/api/doctors", require("./routes/api/doctors"));
app.use("/api/chemists", require("./routes/api/chemists"));
app.use("/api/distributors", require("./routes/api/distributors"));
app.use("/api/employees", require("./routes/api/employees"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/employees/work", require("./routes/api/empWorkRecord"));
app.use("/api/products", require("./routes/api/products"));
app.use("/api/orders", require("./routes/api/orders"));
app.use("/api/employees/territory", require("./routes/api/empTerritory"));

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));
