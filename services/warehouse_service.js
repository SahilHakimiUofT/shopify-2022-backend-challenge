const mongoose = require("mongoose");
const Warehouse = require("../models/Warehouse.js");
const InventoryItem = require("../models/InventoryItem.js");
const InventoryService = require("./inventory_service.js");
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

const addWarehouseInventory = async (warehouseId, inventoryId, quantity) => {
  if (quantity < 0) {
    throw {
      status: 400,
      message: "Cannot assigned quantity less than 0 to warehouse",
    };
  }
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

  let inventoryRecordIndex = warehouse.inventory.findIndex(
    (inventory) => inventory.item == inventoryId
  );

  if (inventoryRecordIndex == -1) {
    InventoryService.quantityCheck(item.item_quantity_unassigned, quantity);
    warehouse.inventory.push({
      item: inventoryId,
      quantity: quantity,
    });
    await warehouse.save();
    await InventoryService.addWarehouse(item, warehouseId, quantity);
  } else {
    let quantityDif =
      warehouse.inventory[inventoryRecordIndex].quantity - quantity;
    if (quantityDif < 0) {
      InventoryService.quantityCheck(
        item.item_quantity_unassigned,
        -1 * quantityDif
      );
    }
    warehouse.inventory[inventoryRecordIndex] = {
      item: inventoryId,
      quantity: quantity,
    };

    await warehouse.save();
    await InventoryService.updateWarehouse(item, warehouseId, quantity);
    return;
  }
};

module.exports = {
  getWarehouses,
  createWarehouse,
  addWarehouseInventory,
};
