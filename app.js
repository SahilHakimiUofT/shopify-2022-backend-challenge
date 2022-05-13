const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
let inventory_route = require("./routes/inventory_route.js");
let warehouse_route = require("./routes/warehouse_route.js");

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//API ROUTES
app.use("/inventory", inventory_route);
app.use("/warehouse", warehouse_route);

module.exports = app;
