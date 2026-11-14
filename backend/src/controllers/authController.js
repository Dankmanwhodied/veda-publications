const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dataStore } = require("../config/dataStore");

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

// Store a keyed hash of the client IP, never the IP itself.
const attemptKey = (ip) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(ip || "unknown").digest("hex");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const clientKey = attemptKey(req.ip);

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter your email and password.",
      });
    }
    if (email.length > 254 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Check your sign-in details and try again.",
      });
    }

    // Count the attempt before checking the password, atomically, so parallel
    // requests can't all slip past the limit. A success clears the count.
    const attempt = await dataStore.recordFailedLogin(clientKey, ATTEMPT_WINDOW_MS);
    if (attempt.count > MAX_ATTEMPTS) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((attempt.resetAt - Date.now()) / 1000))));
      return res.status(429).json({
        success: false,
        message: "Too many sign-in attempts. Try again later.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await dataStore.findEditorByEmail(normalizedEmail);
    const passwordMatch = user
      ? await bcrypt.compare(String(password), user.password)
      : false;

    if (!user || user.role !== "chief_editor" || !passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    try {
      await dataStore.clearLoginAttempts(clientKey);
    } catch (error) {
      // Don't fail a correct sign-in because the counter couldn't be cleared.
      console.error("Clearing sign-in attempts failed:", error.message);
    }
    const token = jwt.sign(
      {
        id: String(user._id || user.id),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: String(user._id || user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Chief Editor sign-in failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to sign in right now.",
    });
  }
};

module.exports = {
  loginUser,
};