const app = require("./app.js");
const port = process.env.PORT || 3000;
const connection = require("./config/database");

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
