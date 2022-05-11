const mongoose = require("mongoose");
const Warehouse = require("../models/Warehouse");
const InventoryItem = require("../models/InventoryItem");
const InventoryService = require("./inventory_service");
const getWarehouses = async () => {
  return Warehouse.find();
};

const createWarehouse = async (warehouse) => {
  const newWarehouse = await Warehouse.create(warehouse);
  return newWarehouse;
};

const warehouseExist = async (warehouseId) => {
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    return false;
  } else {
    return warehouse;
  }
};

const warehouseInventoryExist = async (warehouse, inventoryId) => {};

const addWarehouseInventory = async (warehouseId, inventoryId, quantity) => {
  const warehouse = await warehouseExist(warehouseId);
  if (!warehouse) {
    throw {
      status: 404,
      message: "The warehouse with the given id could not be found",
    };
  }
  const item = await InventoryService.itemExist(inventoryId);
  if (!item) {
    throw {
      status: 404,
      message: "The inventory with the given id could not be found",
    };
  }

  InventoryService.quantityCheck(item.item_quantity_unassigned, quantity);

  let inventoryRecordIndex = warehouse.inventory.findIndex(
    (inventory) => inventory.item == inventoryId
  );

  if (inventoryRecordIndex == -1) {
    warehouse.inventory.push({
      item: inventoryId,
      quantity: quantity,
    });
    await warehouse.save();
    await InventoryService.addWarehouse(item, warehouseId, quantity);
  } else {
    warehouse.inventory[inventoryRecordIndex] = {
      item: inventoryId,
      quantity: quantity,
    };
    await warehouse.save();
    await InventoryService.updateWarehouse(item, warehouseId, quantity);
    return;
  }
};
module.exports = { getWarehouses, createWarehouse, addWarehouseInventory };
