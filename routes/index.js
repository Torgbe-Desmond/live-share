const express = require("express");
const userRoutes = require("./user.routes");
const messageRoutes = require("./message.routes");
const testRoutes = require("./test.routes")
const router = express.Router();

router.use("/users", userRoutes);
router.use("/messages", messageRoutes);
router.use("/test", testRoutes)
module.exports = router;
