const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/media.controller");

router.post("/download", mediaController.download);

module.exports = router;