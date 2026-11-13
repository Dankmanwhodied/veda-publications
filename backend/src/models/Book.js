const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      default: "",
      trim: true,
    },

    synopsis: {
      type: String,
      default: "",
      maxlength: 500,
    },

    abstract: {
      type: String,
      default: "",
      maxlength: 12000,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    isbn: {
      type: String,
      default: "",
      trim: true,
      maxlength: 32,
    },

    coverImageUrl: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);