const express = require("express");
require("dotenv").config();
require("./db");
const bodyParser = require("body-parser");
const postRouter = require("./routes/postRoutes");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json());

app.use("/post", postRouter);

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
});
