const express = require("express");
const bodyParser = require("body-parser");
const dataRoutes = require("./api/data/data.router.js");
const path = require("path");
const cors = require("cors");

const port = process.env.PORT || 3001;
const app = express();

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/data", dataRoutes);
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.listen(port, "0.0.0.0", () => {
  console.log("Running on port:", port);
});

app.get("/", (req, res, next) => {
  res.json({ message: "Hello World!" });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

