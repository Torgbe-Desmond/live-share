const express = require("express");
const router = express.Router();
const multer = require("multer");
const messageController = require("../controllers/message.controller");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), messageController.addMessage);
router.post("/personal", upload.single("file"), messageController.addPersonalMessage);

module.exports = router;
