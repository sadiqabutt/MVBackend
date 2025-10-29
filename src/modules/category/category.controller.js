import {asyncHandler} from "../../core/utils/async-handler.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { ApiError } from "../../core/utils/api-error.js";
import Categories from "../../models/category.model.js";
import StoreProductCategory from "../../models/StoreProductCategory.js";
import FactoryProductCategory from "../../models/FactoryProductCategory.js";

// 🟢 Create Main Category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const existing = await Categories.findOne({ name });
  if (existing) throw new ApiError(400, "Category already exists");

  const category = await Categories.create({ name, description, image });
  res.status(201).json(new ApiResponse(201, category, "Category created"));
});

// 🟢 Get All Categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Categories.find();
  res.status(200).json(new ApiResponse(200, categories, "Categories retrieved"));
});

// 🟢 Update Category
export const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const updated = await Categories.findByIdAndUpdate(categoryId, req.body, { new: true });
  if (!updated) throw new ApiError(404, "Category not found");
  res.status(200).json(new ApiResponse(200, updated, "Category updated"));
});

// 🟢 Delete Category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const deleted = await Categories.findByIdAndDelete(categoryId);
  if (!deleted) throw new ApiError(404, "Category not found");
  res.status(200).json(new ApiResponse(200, {}, "Category deleted"));
});

// 🟢 Assign Category to Store
export const assignCategoryToStore = asyncHandler(async (req, res) => {
  const { storeID, categoryID } = req.body;
  const existing = await StoreProductCategory.findOne({ storeID, categoryID });
  if (existing) throw new ApiError(400, "Category already assigned to store");

  const storeCat = await StoreProductCategory.create({ storeID, categoryID });
  res.status(201).json(new ApiResponse(201, storeCat, "Category assigned to store"));
});

// 🟢 Assign Category to Factory
export const assignCategoryToFactory = asyncHandler(async (req, res) => {
  const { factoryID, categoryID } = req.body;
  const existing = await FactoryProductCategory.findOne({ factoryID, categoryID });
  if (existing) throw new ApiError(400, "Category already assigned to factory");

  const factoryCat = await FactoryProductCategory.create({ factoryID, categoryID });
  res.status(201).json(new ApiResponse(201, factoryCat, "Category assigned to factory"));
});
