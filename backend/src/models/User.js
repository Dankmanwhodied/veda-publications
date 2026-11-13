const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["chief_editor"],
      default: "chief_editor",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "chief_editor" },
    name: "one_chief_editor",
  }
);

module.exports = mongoose.model("User", userSchema);