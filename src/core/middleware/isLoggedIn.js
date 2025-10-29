// src/core/middleware/isLoggedIn.js
import jwt from "jsonwebtoken";
import User from "../../models/User.model.js";
import Admin from "../../models/admin.models.js";

// ✅ isLoggedIn middleware
export const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.accessToken;

    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  
const user =
  (await User.findById(decoded._id || decoded.id).select("-userPassword")) ||
  (await Admin.findById(decoded._id || decoded.id).select("-password"));

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // check for all possible role fields
    const role = req.user.userRole || req.user.role || req.user.adminRole;
    if (!role) {
      return res.status(403).json({
        success: false,
        message: "User role not found",
      });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};
