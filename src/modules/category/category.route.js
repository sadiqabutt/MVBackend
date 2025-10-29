import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  assignCategoryToStore,
  assignCategoryToFactory,
} from "./category.controller.js";

const router = express.Router();

// ✅ CRUD for Categories
router.post("/", isLoggedIn, createCategory);
router.get("/getall", getAllCategories);
router.patch("/:categoryId", isLoggedIn, updateCategory);
router.delete("/:categoryId", isLoggedIn, deleteCategory);

// ✅ Assign categories
router.post("/store", isLoggedIn, assignCategoryToStore);
router.post("/factory", isLoggedIn, assignCategoryToFactory);

export default router;
