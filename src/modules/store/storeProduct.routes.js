
import express from "express";
import multer from "multer";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  changeProductStatus,
  viewOwnTransactions,
  giveFeedback,
  placeOrder,
} from "./storeProduct.controller.js";
import { isLoggedIn, authorizeRoles } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🟢 Create Store Product
router.post(
  "/",
  isLoggedIn,
  authorizeRoles("store-admin"),
  upload.single("productImage"),
  createProduct
);

// 🟡 Update Store Product
router.put(
  "/:id",
  isLoggedIn,
  authorizeRoles("store-admin"),
  upload.single("productImage"),
  updateProduct
);

// 🔴 Delete Store Product
router.delete(
  "/:id",
  isLoggedIn,
  authorizeRoles("store-admin"),
  deleteProduct
);

// 🔍 Public Routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// 🟣 Admin: Approve / Reject Product
router.patch(
  "/verify/:id",
  isLoggedIn,
  authorizeRoles("admin"),
  changeProductStatus
);

router.get("/store/transactions", viewOwnTransactions);
router.post("/store/feedback", isLoggedIn, giveFeedback);
router.post("/store/order", isLoggedIn, placeOrder);
export default router;
