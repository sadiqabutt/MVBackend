import express from "express";
import multer from "multer";
import {
  createFactory,
  updateFactory,
  deleteFactory,
  getAllFactories,
  getFactoryById,
  changeFactoryStatus,
} from "./factory.controller.js";
import { isLoggedIn, authorizeRoles } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Multiple uploads: logo + license
const factoryUploads = upload.fields([
  { name: "factoryLogo", maxCount: 1 },
  { name: "factoryLicenseImage", maxCount: 1 },
]);

// Routes
router.post("/", isLoggedIn, authorizeRoles("factory-admin"), factoryUploads, createFactory);
router.put("/:id", isLoggedIn, authorizeRoles("factoryOwner"), factoryUploads, updateFactory);
router.delete("/:id", isLoggedIn, authorizeRoles("factoryOwner"), deleteFactory);
router.get("/", getAllFactories);
router.get("/:id", getFactoryById);

// Admin approval
router.patch("/verify/:id", isLoggedIn, authorizeRoles("admin"), changeFactoryStatus);

export default router;
