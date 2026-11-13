const express = require("express");

const { loginUser } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, authorize("chief_editor"), (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;