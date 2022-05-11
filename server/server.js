const app = require("./app.js");
const port = 3000 || process.env.PORT;
const connection = require("../config/database");
// const express = require('express')
// const mongoose = require('mongoose')
// const bodyParser = require('body-parser')
// require('dotenv').config();
// const port = 3000 || process.env.PORT
// let inventory_route = require('./routes/inventory_route')
// let warehouse_route = require('./routes/warehouse_route')

// const app = express()
// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(bodyParser.json())

// //API ROUTES
// app.use('/inventory',inventory_route)
// app.use('/warehouse',warehouse_route)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
