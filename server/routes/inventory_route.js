const router = require("express").Router();
const mongoose = require("mongoose");
const InventoryItem = require("../models/InventoryItem");
const InventoryService = require("../services/inventory_service");

//Get the list of all the inventory items and return in response
router.get("/", async (req, res) => {
  try {
    const inventoryList = await InventoryService.getItems();
    res.status(200).send(inventoryList);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Get an inventory item from its id
router.get("/:id", async (req, res) => {
  try {
    const item = await InventoryService.itemExist(req.params.id);
    if (!item) {
      res.status(404).send("The item with the given id could not be found");
    } else {
      res.status(200).send(item);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});
//Insert a new inventory item into the database, the id is returned with a status of 201 if successful
router.post("/", async (req, res) => {
  try {
    const item = await InventoryService.createItem(req.body);
    res.status(201).send(item.id);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Update an existing inventory item by included the item id in the api request param, if an invalid id is entered then status 400 will be returned, if no item is found 401 will, otherwise status 200 will return with the updated item in the response

router.put("/:id", async (req, res) => {
  try {
    const item = await InventoryService.updateItem(req.params.id, req.body);
    res.status(200).send(item);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(400).send(err.message);
    }
  }
});

//Delete inventory items by including the id for the requested item in the URL
router.delete("/:id", async (req, res) => {
  try {
    const item = await InventoryService.deleteItem(req.params.id);
    res.status(200).send("Successful deletion of the requested item");
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(400).send(err.message);
    }
  }
});

module.exports = router;
