const mongoose = require("mongoose");
require("dotenv").config();
const conn =
  process.env.MONGODB_URI || "mongodb://localhost:27017/InventoryManagement";

const connection = mongoose.connect(
  conn,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) console.log(err);
    else console.log("mongdb is connected");
  }
);
