const router = require("express").Router();
const mongoose = require("mongoose");
const Warehouse = require("../models/Warehouse");
const InventoryItem = require("../models/InventoryItem");
const WarehouseService = require("../services/warehouse_service");
//Get the list of all the warehouses and return in response

router.get("/", async (req, res) => {
  try {
    const warehouseList = await WarehouseService.getWarehouses();
    res.status(200).send(warehouseList);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Create a new warehouse

router.post("/", async (req, res) => {
  try {
    const warehouse = await WarehouseService.createWarehouse(req.body);
    res.status(201).send(warehouse);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Assign inventory item to a warehouse, the id for the warehouse should be in the URL
router.put("/:id", async (req, res) => {
  try {
    await WarehouseService.addWarehouseInventory(
      req.params.id,
      req.body.item_id,
      req.body.quantity
    );
    res.status(200).send("Inventory succesfully added to warehouse");
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(400).send(err.message);
    }
  }
});

module.exports = router;
