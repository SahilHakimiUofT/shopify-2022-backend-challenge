const app = require("./app.js");
require("dotenv").config();
const port = process.env.PORT || 3000;
const connection = require("./config/Database.js");

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
