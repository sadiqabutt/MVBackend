import express from "express";
import { upload } from "../../core/middleware/multer.js"; // ✅ same multer you used earlier
import {
  createStore,
  updateStore,
  changeStoreStatus,
  getAllStores,
  getStoreById,
} from "../../modules/store/store.controller.js";
import { isLoggedIn, authorizeRoles } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();

// ✅ Create Store (user)
router.post(
  "/create",
  isLoggedIn,
  upload.fields([
    { name: "storeLogo", maxCount: 1 },
    { name: "idCardImage", maxCount: 1 },
  ]),
  createStore
);

// ✅ Update Store (user)
router.put(
  "/update/:id",
  isLoggedIn,
  upload.fields([
    { name: "storeLogo", maxCount: 1 },
    { name: "idCardImage", maxCount: 1 },
  ]),
  updateStore
);

// ✅ Change Store Status (admin only)
router.patch(
  "/status/:id",
  isLoggedIn,
  authorizeRoles("admin"),
  changeStoreStatus
);

// ✅ Get All Stores
router.get("/all", getAllStores);

export default router;

// ✅ Get Single Store by ID
router.get("/:id", isLoggedIn, getStoreById);
