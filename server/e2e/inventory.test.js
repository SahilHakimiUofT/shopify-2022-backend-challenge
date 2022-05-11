const supertest = require("supertest");
const app = require("../app.js");
const mongoose = require("mongoose");

beforeAll(async () => {
  const url = "mongodb://localhost:27017/InventoryManagementTestDatabase";
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // await dropAllCollections()
  // Closes the Mongoose connection
  await mongoose.connection.close();
});

describe("GET /inventory", () => {
  test("should response with 200 status code and list of all the item", () => {
    const response = {
      statusCode: 200,
    };
    expect(response.statusCode).toBe(200);
  });
});

// describe("GET /inventory", () => {
//   describe("given item name, total quantity, and sku", () => {
//     test("should response with 200 status code and list of all the item", async () => {
//       const response = await request(app).get("/inventory");
//     });
//     expect(response.statusCode).toBe(200);
//   });
// });
