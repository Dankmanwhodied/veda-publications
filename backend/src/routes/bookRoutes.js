const express = require("express");

const {
  getBooks,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getBooks);

router.get("/admin", protect, authorize("chief_editor"), getAllBooks);

router.post("/", protect, authorize("chief_editor"), createBook);

router.put("/:id", protect, authorize("chief_editor"), updateBook);

router.delete("/:id", protect, authorize("chief_editor"), deleteBook);

module.exports = router;