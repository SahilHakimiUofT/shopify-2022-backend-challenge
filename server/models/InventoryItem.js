const mongoose = require("mongoose");

const AssignedWarehouseSchema = new mongoose.Schema({
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  quantity_assigned: { type: Number, min: 0 },
});

const InventoryItemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  item_total_quantity: { type: Number, min: 0, required: true },
  item_sku: { type: String, required: false },
  item_quantity_unassigned: {
    type: Number,
    min: 0,
    default: 0,
  },
  item_price: { type: Number, min: 0, default: 0 },
  assigned_warehouses: { type: [{ type: AssignedWarehouseSchema }] },
});

const InventoryItem = mongoose.model("InventoryItem", InventoryItemSchema);

module.exports = InventoryItem;
