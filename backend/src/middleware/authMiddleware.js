const jwt = require("jsonwebtoken");
const { dataStore } = require("../config/dataStore");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (
    typeof decoded !== "object" ||
    !decoded.id ||
    typeof decoded.exp !== "number" ||
    decoded.exp <= Date.now() / 1000
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }

  try {
    const user = await dataStore.findEditorById(decoded.id);
    if (!user || user.role !== "chief_editor") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    req.user = {
      id: String(user._id || user.id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (error) {
    console.error("Chief Editor session lookup failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to verify the session right now.",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return next();
  };
};

module.exports = {
  protect,
  authorize,
};