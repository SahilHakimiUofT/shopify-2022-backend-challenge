const request = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");
const { create } = require("../models/InventoryItem.js");
const InventoryItem = require("../models/InventoryItem.js");
require("dotenv").config();
//This is a random unique id that I will use for my test item
const testItemId = new mongoose.Types.ObjectId();
//This is the test item data that I will use for my put and get request tests a
const testItemData = {
  _id: testItemId,
  item_name: "test item",
  item_total_quantity: 100,
  item_price: 50,
};

//connect to database before testing and add test item to inventory collection
beforeAll(() => {
  const url =
    process.env.MONGODB_TEST_URI ||
    "mongodb://localhost:27017/InventoryManagementTestDatabase";
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
    })
    .catch((err) => {
      console.log("Failed to connect to MongoDB", err);
    });
  // await mongoose.connect(url, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });
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

describe("POST /inventory", () => {
  describe("Given required fields and item_price", () => {
    test("should respond with status code 201 and item", async () => {
      const mockItem = {
        item_name: "Chocolate Bars",
        item_total_quantity: 35,
        item_price: 30,
      };
      const response = await request(app).post("/inventory").send(mockItem);
      expect(response.body.item_name).toBe(mockItem.item_name);
      expect(response.body.item_total_quantity).toBe(
        mockItem.item_total_quantity
      );
      expect(response.body.item_price).toBe(mockItem.item_price);
      expect(response.statusCode).toBe(201);
    });
  });
  describe("Given request will be missing required fields and be empty", () => {
    test("should respond with status code 400", async () => {
      const response = await request(app).post("/inventory").send();
      expect(response.statusCode).toBe(400);
    });
  });
});

describe("GET /inventory", () => {
  describe("Given an empty request and no other paramaters in url", () => {
    test("should respond with 200 status code and list of all the items", async () => {
      const response = await request(app).get("/inventory").send();
      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toBeTruthy();
    });
  });

  describe("Given a valid id in url for existing item in database", () => {
    test("should respond with item and status code 200", async () => {
      const response = await request(app)
        .get(`/inventory/${testItemData._id}`)
        .send();
      expect(response.statusCode).toBe(200);
      expect(response.body.item_name).toBe(testItemData.item_name);
      expect(response.body.item_total_quantity).toBe(
        testItemData.item_total_quantity
      );
      expect(response.body.item_price).toBe(testItemData.item_price);
    });
  });

  describe("Given an id not existing in the collection", () => {
    test("invalid id, should respond with status code 400", async () => {
      const response = await request(app).get("/inventory/abc").send();
      expect(response.statusCode).toBe(400);
    });
    test("id thats not in collection, should respond with code 404", async () => {
      const id = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/inventory/${id}`).send();
      expect(response.statusCode).toBe(404);
    });
  });
});

describe("PUT /inventory/:id", () => {
  describe("Given a valid id in the database", () => {
    test("should respond with status code 200", async () => {
      const response = await request(app)
        .put(`/inventory/${testItemData._id}`)
        .send({
          item_name: "test_item_updated",
          item_price: 99,
          item_total_quantity: 110,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.item_name).toBe("test_item_updated");
      expect(response.body.item_price).toBe(99);
      expect(response.body.item_total_quantity).toBe(110);
      expect(response.body.item_quantity_unassigned).toBe(110);
      expect(response.body._id).toBe(testItemData._id.toString());
    });
  });
  describe("Given a valid id that is not in the database", () => {
    test("should respond with status code 404", async () => {
      const randomId = new mongoose.Types.ObjectId();
      const response = await request(app).put(`/inventory/${randomId}`).send({
        item_name: "test_item_updated",
        item_price: 99,
        item_total_quantity: 110,
      });
      expect(response.statusCode).toBe(404);
    });
  });
  describe("Given an invalid id", () => {
    test("should respond with status code 400", async () => {
      const response = await request(app).put("/inventory/abc").send();
      expect(response.statusCode).toBe(400);
    });
  });
});

describe("DELETE /inventory:id", () => {
  describe("Given a valid id in the database", () => {
    test("should respond with status code 200", async () => {
      const deleteItem = await InventoryItem.create({
        item_name: "test item",
        item_total_quantity: 100,
        item_price: 50,
      });

      const response = await request(app)
        .delete(`/inventory/${deleteItem._id}`)
        .send();
      expect(response.statusCode).toBe(200);
    });
  });
  describe("Given a valid id not in the database", () => {
    test("should respond with status code 404", async () => {
      const randomId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/inventory/${randomId}`)
        .send();
      expect(response.statusCode).toBe(404);
    });
  });
  describe("Given an invalid id", () => {
    test("should respond with status code 400", async () => {
      const response = await request(app).delete("/inventory/abc").send();
      expect(response.statusCode).toBe(400);
    });
  });
});
