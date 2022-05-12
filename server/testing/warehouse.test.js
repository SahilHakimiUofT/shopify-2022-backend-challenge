const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
const { create } = require("../models/InventoryItem.js");
const InventoryItem = require("../models/InventoryItem.js");
const Warehouse = require("../models/Warehouse.js");
//This is a random unique id that I will use for my test item
const testItemId = new mongoose.Types.ObjectId();
//This is the test item data that I will use for my put tests
const testItemData = {
  _id: testItemId,
  item_name: "test item",
  item_total_quantity: 100,
  item_price: 50,
};
//This is a random unique id that I will use for my test warehouse
const warehouseId = new mongoose.Types.ObjectId();
//This is the warehouse test data that I will use for my put request tests
const warehouseData = {
  _id: warehouseId,
  warehouse_name: "Amazon",
  province: "Ontario",
  city: "Toronto",
  country: "Canada",
  address: "58 Convention Drive",
};
//connect to database before testing and add test item to inventory collection
beforeAll(() => {
  const url = "mongodb://localhost:27017/InventoryManagementTestDatabase";
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      // console.log("MongoDB connected!!");
      const testItem = new InventoryItem(testItemData);
      testItem.item_quantity_unassigned = testItem.item_total_quantity;
      await testItem.save();
      const testWarehouse = new Warehouse(warehouseData);
      await testWarehouse.save();
    })
    .catch((err) => {
      console.log("Failed to connect to MongoDB", err);
    });
});
async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}
//close to database after testing and drop all collections to avoid errors when testing again
afterAll(async () => {
  //clear out the test database after the tests are done running
  await removeAllCollections();
  // Closes the Mongoose connection
  await mongoose.connection.close();
});

describe("POST /warehouse", () => {
  describe("Given all the required fields for a warehouse", () => {
    test("should respond with status code 201 and warehouse", async () => {
      const mockWarehouse = {
        warehouse_name: "Amazon Two",
        province: "Alberta",
        country: "Canada",
        city: "Edmonton",
        address: "58 Amazonian Drive",
      };
      const response = await request(app)
        .post("/warehouse")
        .send(mockWarehouse);
      expect(response.statusCode).toBe(201);
      expect(response.body.warehouse_name).toBe(mockWarehouse.warehouse_name);
      expect(response.body.province).toBe(mockWarehouse.province);
      expect(response.body.country).toBe(mockWarehouse.country);
      expect(response.body.city).toBe(mockWarehouse.city);
      expect(response.body.address).toBe(mockWarehouse.address);
    });
  });

  describe("Given an invalid empty request body", () => {
    test("should respond with status code 400", async () => {
      const response = await request(app).post("/warehouse").send();
      expect(response.statusCode).toBe(400);
    });
  });
});

describe("GET /warehouse", () => {
  describe("Given empty request body and no parameters in url", () => {
    test("should respond with a list of warehouses, atleast 1, and status code 200", async () => {
      const response = await request(app).get("/warehouse").send();
      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toBeTruthy();
    });
  });
});

describe("PUT /warehouse/:id", () => {
  describe("Given a valid warehouse id in database and a valid item id in database", () => {
    describe("Given a valid (>0 and <unassigned quantity) quantity to be assigned", () => {
      test("should respond with status code 200 and assigned inventory to warehouse", async () => {
        const response = await request(app)
          .put(`/warehouse/${warehouseData._id}`)
          .send({
            item_id: testItemData._id,
            quantity: 1,
          });
        expect(response.statusCode).toBe(200);
      });
      describe("Given an invalid (negative) quantity to be assigned", () => {
        test("should respond with status code 400", async () => {
          const response = await request(app)
            .put(`/warehouse/${warehouseData._id}`)
            .send({
              item_id: testItemData._id,
              quantity: -1,
            });
          expect(response.statusCode).toBe(400);
        });
      });
    });
  });
  describe("Given a valid warehouse id in database and valid item id that are not in database", () => {
    test("should respond with status code 404", async () => {
      const firstRandomId = new mongoose.Types.ObjectId();
      const secondRandomId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/warehouse/${firstRandomId}`)
        .send({
          item_id: secondRandomId,
          quantity: 0,
        });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("Given invalid warehouse id or invalid item id", () => {
    describe("Given invalid warehouse id", () => {
      test("should respond with status code 400,", async () => {
        const response = await request(app).put("/warehouse/abcd").send({
          item_id: testItemData._id,
          quantity: 0,
        });
        expect(response.statusCode).toBe(400);
      });
    });
    describe("Given invalid item id", () => {
      test("should respond with status code 400,", async () => {
        const response = await request(app)
          .put(`/warehouse/${warehouseData._id}`)
          .send({
            item_id: "abcd",
            quantity: 0,
          });
        expect(response.statusCode).toBe(400);
      });
    });
  });
});
