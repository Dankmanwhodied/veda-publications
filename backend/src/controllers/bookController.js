const { dataStore } = require("../config/dataStore");

const BOOK_FIELDS = [
  "title",
  "author",
  "category",
  "isbn",
  "synopsis",
  "abstract",
  "coverImageUrl",
  "status",
];

const validateInputTypes = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "Provide book details as a JSON object.";
  }
  for (const field of BOOK_FIELDS) {
    if (Object.hasOwn(input, field) && typeof input[field] !== "string") {
      return `${field} must be text.`;
    }
  }
  return null;
};

const sanitizeBook = (input) => {
  const book = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return book;
  }
  for (const field of BOOK_FIELDS) {
    if (typeof input[field] === "string") {
      book[field] = input[field].trim();
    }
  }
  return book;
};

const validateBook = (book) => {
  if (!book.title) return "A book title is required.";
  if (book.title.length > 200) return "The title must be 200 characters or fewer.";
  if ((book.author || "").length > 200) return "The author must be 200 characters or fewer.";
  if ((book.category || "").length > 100) return "The category must be 100 characters or fewer.";
  if ((book.isbn || "").length > 32) return "The ISBN must be 32 characters or fewer.";
  if ((book.synopsis || "").length > 500) return "The synopsis must be 500 characters or fewer.";
  if ((book.abstract || "").length > 12000) return "The abstract must be 12,000 characters or fewer.";
  if ((book.coverImageUrl || "").length > 1000) return "The cover image URL must be 1,000 characters or fewer.";
  if (!["published", "draft"].includes(book.status)) {
    return "Choose either published or draft status.";
  }
  if (book.coverImageUrl && !book.coverImageUrl.startsWith("/")) {
    try {
      if (new URL(book.coverImageUrl).protocol !== "https:") {
        return "Cover images must use an HTTPS URL or a local path.";
      }
    } catch {
      return "Enter a valid HTTPS cover URL or a local path.";
    }
  } else if (book.coverImageUrl && (book.coverImageUrl.startsWith("//") || book.coverImageUrl.split("/").includes(".."))) {
    return "Enter a site-relative cover image path.";
  }
  return null;
};

const sendError = (res, error, message) => {
  if (
    error.name === "ValidationError" ||
    error.name === "CastError" ||
    error.code === "23505" ||
    error.code === "23514"
  ) {
    return res.status(400).json({
      success: false,
      message: "Check the book details and try again.",
    });
  }
  console.error(`${message}:`, error.message);
  return res.status(500).json({
    success: false,
    message,
  });
};

const getBooks = async (_req, res) => {
  try {
    const books = await dataStore.getPublishedBooks();
    return res.json({ success: true, count: books.length, books });
  } catch (error) {
    return sendError(res, error, "Failed to fetch books.");
  }
};

const getAllBooks = async (_req, res) => {
  try {
    const books = await dataStore.getAllBooks();
    return res.json({ success: true, count: books.length, books });
  } catch (error) {
    return sendError(res, error, "Failed to fetch books.");
  }
};

const createBook = async (req, res) => {
  const inputError = validateInputTypes(req.body);
  if (inputError) {
    return res.status(400).json({ success: false, message: inputError });
  }
  const bookData = sanitizeBook(req.body);
  if (!Object.hasOwn(bookData, "status")) bookData.status = "draft";
  const validationError = validateBook(bookData);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const book = await dataStore.createBook(bookData);
    return res.status(201).json({
      success: true,
      message: "Book created successfully.",
      book,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create book.");
  }
};

const updateBook = async (req, res) => {
  const inputError = validateInputTypes(req.body);
  if (inputError) {
    return res.status(400).json({ success: false, message: inputError });
  }
  const bookData = sanitizeBook(req.body);
  if (!Object.keys(bookData).length) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one book field to update.",
    });
  }
  if (!Object.hasOwn(bookData, "status")) {
    try {
      const existingBook = await dataStore.findBookById(req.params.id);
      if (!existingBook) {
        return res.status(404).json({ success: false, message: "Book not found." });
      }
      bookData.status = existingBook.status;
    } catch (error) {
      return sendError(res, error, "Failed to update book.");
    }
  }
  const validationError = validateBook(bookData);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const book = await dataStore.updateBook(req.params.id, bookData);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    return res.json({ success: true, message: "Book updated successfully.", book });
  } catch (error) {
    return sendError(res, error, "Failed to update book.");
  }
};

const deleteBook = async (req, res) => {
  try {
    const deleted = await dataStore.deleteBook(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    return res.json({ success: true, message: "Book deleted successfully." });
  } catch (error) {
    return sendError(res, error, "Failed to delete book.");
  }
};

module.exports = {
  getBooks,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
};
