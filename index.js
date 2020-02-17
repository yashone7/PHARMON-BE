const express = require("express");
const app = express();
const connectDB = require("./config/db");

// Connect to the database
connectDB();

// Initialize middleware to parse request object
app.use(express.json({ extended: false }));

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
