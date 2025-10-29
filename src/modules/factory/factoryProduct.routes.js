
import express from "express";
import multer from "multer";
import {
  createFactoryProduct,
  updateFactoryProduct,
  deleteFactoryProduct,
  getAllFactoryProducts,
  getFactoryProductById,
  changeFactoryProductStatus,
  viewOwnTransactions,
} from "./factoryProduct.controller.js";
import { isLoggedIn, authorizeRoles } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Single image upload
router.post("/", isLoggedIn, authorizeRoles("factory-admin"), upload.single("productImage"), createFactoryProduct);
router.put("/:id", isLoggedIn, authorizeRoles("factory-admin"), upload.single("productImage"), updateFactoryProduct);
router.delete("/:id", isLoggedIn, authorizeRoles("factory-admin"), deleteFactoryProduct);
router.get("/all", getAllFactoryProducts);
router.get("/:id", getFactoryProductById);

// Admin approval
router.patch("/verify/:id", isLoggedIn, authorizeRoles("admin"), changeFactoryProductStatus);
// ✅ Factory can view only its own transactions
router.get("/factory/transactions", isLoggedIn, viewOwnTransactions);

export default router;
