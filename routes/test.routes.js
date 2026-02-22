const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
  res.json({ message: "we are chatting!!!" });
});

module.exports = router;
