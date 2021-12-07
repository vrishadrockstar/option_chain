const router = require("express").Router();
const { getData, getMasterData } = require("./data.controller");

router.get("/", getData);
router.get("/master", getMasterData);

module.exports = router;
