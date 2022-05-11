const mongoose = require("mongoose");

const AssignedItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, min: 0, required: true },
});

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  inventory: [{ type: AssignedItemSchema }],
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  province: { type: String, required: true },
});

const Warehouse = mongoose.model("Warehouse", WarehouseSchema);

module.exports = Warehouse;
