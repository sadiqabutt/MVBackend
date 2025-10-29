
import express from "express";
import { upload } from "../../core/middleware/multer.js";
import { isAuthenticated, authorizeRoles } from "../../core/middleware/authMiddleware.js";
import {
  getAllUsers,
  createUser,
  updateUserAvatar,
  deleteUserAvatar,
  getUserProfile,
  updateUserProfile,
  viewAllProducts,
  addProductReview,
  giveFeedback,
  placeOrder,
  viewOwnTransactions,
  trackOrderStatus,
} from "./user.controller.js";

const router = express.Router();

// ==============================
// 👤 USER PROFILE ROUTES
// ==============================
router.get("/", getAllUsers);
router.get("/:userId", getUserProfile);
router.post("/", upload.single("avatar"), createUser);

// ✅ Update full user profile (name, address, phone, optional image)
router.patch(
  "/update/:userId",
  isAuthenticated,
  upload.single("profileImage"),
  updateUserProfile
);

// ✅ Update / Delete avatar
router.patch("/avatar/:userId", upload.single("avatar"), updateUserAvatar);
router.delete("/avatar/:userId", deleteUserAvatar);

// ==============================
// 🛍️ BUYER-SPECIFIC ROUTES
// ==============================

// ✅ View all products (store + factory)
router.get("/buyer/products/all", viewAllProducts);

// ✅ Add a product review
router.post("/buyer/review", isAuthenticated, addProductReview);

// ✅ Give feedback to store/factory
router.post("/buyer/feedback", isAuthenticated, giveFeedback);

//place order
router.post("/buyer/order", isAuthenticated, placeOrder);

// ✅ Track order status
router.get("/buyer/order/:orderType/:orderId", isAuthenticated, trackOrderStatus);


router.get("/buyer/transactions", isAuthenticated, viewOwnTransactions);


export default router;
