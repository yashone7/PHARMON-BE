const config = require("config");
const mongoose = require("mongoose");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(
      db,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      },
      console.log("mongoDB connected...")
    );
  } catch (err) {
    console.error(err.message);
    // Process failed with exit code 1
    process.exit(1);
  }
};

module.exports = connectDB;
