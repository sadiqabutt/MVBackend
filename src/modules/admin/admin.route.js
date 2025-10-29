import express from "express";
import multer from "multer";
import { authorizeRoles } from "../../core/middleware/roleMiddleware.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfileImage,
  deleteAdminProfileImage,
  updateAdmin,       // ✅ super-admin update
  deleteAdmin ,       // ✅ super-admin delete
} from "./admin.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --------------------------
// Admin Auth Routes
// --------------------------
router.post("/register", upload.single("profileImage"), registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", isLoggedIn, logoutAdmin);

// --------------------------
// Super-admin only routes
// --------------------------
router.patch("/:id", isLoggedIn, authorizeRoles("super-admin"), updateAdmin);
router.delete("/:id", isLoggedIn, authorizeRoles("super-admin"), deleteAdmin);

// --------------------------
// Admin Profile Routes
// --------------------------
router.get("/me", isLoggedIn, getAdminProfile);
router.patch("/profile/image", isLoggedIn, upload.single("profileImage"), updateAdminProfileImage);
router.delete("/profile/image", isLoggedIn, deleteAdminProfileImage);

export default router;
