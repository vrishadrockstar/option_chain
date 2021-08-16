const express = require("express");
const bodyParser = require("body-parser");
const dataRoutes = require("./api/data/data.router.js");
const path = require("path");

const port = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/data", dataRoutes);
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.listen(port, "0.0.0.0", () => {
  console.log("Running on port:", port);
});

app.get("/", (req, res, next) => {
  res.json({ message: "Hello World" });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});
