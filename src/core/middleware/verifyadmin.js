// src/core/middleware/verifyadmin.js
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.model.js";
import { ApiError } from "../utils/api-error.js";

const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;
  if (!token) return next(new ApiError(401, "Access denied. No token provided."));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await Admin.findById(decoded._id);
    if (!admin) return next(new ApiError(404, "Admin not found"));

    req.user = admin;
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

export default verifyAdmin;
