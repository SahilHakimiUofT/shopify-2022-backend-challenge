const mongoose = require("mongoose");
const InventoryItem = require("../models/InventoryItem.js");
const Warehouse = require("../models/Warehouse.js");

const getItems = async () => {
  return InventoryItem.find();
};

const createItem = async (inventoryItem) => {
  const item = await InventoryItem.create({
    ...inventoryItem,
    item_quantity_unassigned: inventoryItem.item_total_quantity,
  });

  return item;
};

const itemExist = async (inventoryId) => {
  const item = await InventoryItem.findById(inventoryId);

  if (!item) {
    return false;
  } else {
    return item;
  }
};

const updateItem = async (inventoryId, inventoryItem) => {
  const item = await itemExist(inventoryId);
  if (!item) {
    throw {
      status: 404,
      message: "The item with the given id could not be found",
    };
  } else {
    if (inventoryItem.item_name) {
      item.item_name = inventoryItem.item_name;
    }
    if (inventoryItem.item_total_quantity != undefined) {
      //Extra logic needed here because the total quantity and assigned/unassigned quantity are dependant on each other, cannot lower quantity below assigned quantity (total quantity - unassigned quantity)
      if (
        inventoryItem.item_total_quantity < item.item_total_quantity &&
        item.item_quantity_unassigned == 0
      ) {
        throw {
          status: 400,
          message:
            "Need to remove some inventory from warehouses, not enough free quantity to lower to the reuqested amount",
        };
      }

      item.item_quantity_unassigned =
        item.item_quantity_unassigned +
        (inventoryItem.item_total_quantity - item.item_total_quantity);

      item.item_total_quantity = inventoryItem.item_total_quantity;
    }
    if (inventoryItem.item_sku) {
      item.item_sku = inventoryItem.item_sku;
    }
    if (inventoryItem.item_price != undefined) {
      item.item_price = inventoryItem.item_price;
    }
    await item.save();
    return item;
  }
};

const deleteItem = async (inventoryId) => {
  const item = await InventoryItem.findByIdAndDelete(inventoryId);
  if (!item) {
    throw {
      status: 404,
      message: "The item with the given id could not be found for deletion",
    };
  } else {
    const warehouses = item.assigned_warehouses.map(
      (warehouseRecord) => warehouseRecord.warehouse
    );

    if (warehouses.length != 0) {
      console.log("All assigned warehouses are " + warehouses);
      const itemId = item._id;
      warehouses.forEach(async (warehouseId) => {
        try {
          await Warehouse.findOneAndUpdate(
            { _id: warehouseId },
            { $pull: { inventory: { item: itemId } } },
            { safe: true, multi: false }
          );
        } catch (err) {
          throw err;
        }
      });
    }
    return item;
  }
};

const quantityCheck = (unassignedQuantity, quantityNeeded) => {
  if (quantityNeeded > unassignedQuantity) {
    throw {
      status: 400,
      message:
        "Not enough quantity left to assign to warehouse, try again with lower quantity or add more inventory of item ",
    };
  }
};

const addWarehouse = async (item, warehouseId, quantity) => {
  item.assigned_warehouses.push({
    warehouse: warehouseId,
    quantity_assigned: quantity,
  });
  item.item_quantity_unassigned -= quantity;
  await item.save();
  return;
};

const updateWarehouse = async (item, warehouseId, itemQuantity) => {
  let warehouseRecordIndex = item.assigned_warehouses.findIndex(
    (assigendWarehouse) => assigendWarehouse.warehouse == warehouseId
  );

  item.item_quantity_unassigned =
    item.item_quantity_unassigned -
    (itemQuantity -
      item.assigned_warehouses[warehouseRecordIndex].quantity_assigned);

  item.assigned_warehouses[warehouseRecordIndex] = {
    warehouse: warehouseId,
    quantity_assigned: itemQuantity,
  };
  await item.save();
  return;
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  itemExist,
  quantityCheck,
  addWarehouse,
  updateWarehouse,
};
