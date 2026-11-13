const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dataStore } = require("../config/dataStore");

const loginAttempts = new Map();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const clientKey = req.ip || "unknown";
    const currentAttempt = loginAttempts.get(clientKey);

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

    if (currentAttempt && currentAttempt.resetAt <= Date.now()) {
      loginAttempts.delete(clientKey);
    }

    const activeAttempt = loginAttempts.get(clientKey);
    if (activeAttempt?.count >= MAX_ATTEMPTS) {
      res.set("Retry-After", String(Math.ceil((activeAttempt.resetAt - Date.now()) / 1000)));
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
      loginAttempts.set(clientKey, {
        count: (activeAttempt?.count || 0) + 1,
        resetAt: activeAttempt?.resetAt || Date.now() + ATTEMPT_WINDOW_MS,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    loginAttempts.delete(clientKey);
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