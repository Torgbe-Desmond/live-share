const express = require("express");
const router = express.Router();

router.post("", (req, res) => {
  res.json({ message: "we are chatting!!!" });
});

module.exports = router;
