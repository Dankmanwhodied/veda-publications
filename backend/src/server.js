const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 bytes.");
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed."));
  },
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Veda Publications API is running 🚀",
  });
});

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found.",
  });
});

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error.message);
  const requestedStatus = Number(error.statusCode || error.status);
  const statusCode = requestedStatus >= 400 && requestedStatus < 600 ? requestedStatus : 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 ? "Invalid request." : "The request could not be completed.",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Veda Publications Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();