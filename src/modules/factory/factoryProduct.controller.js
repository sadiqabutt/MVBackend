
import FactoryProduct from "../../models/FactoryProduct.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import FactoryTransaction from "../../models/FactoryTransaction.js";
import {ApiResponse} from "../../core/utils/api-response.js";

// 🟢 Create Factory Product
export const createFactoryProduct = asyncHandler(async (req, res) => {
  const {
    factoryID,
    productName,
    productDescription,
    productCategory, // direct category ID
    price,
    quantity,
  } = req.body;

  if (!factoryID || !productName || !productCategory || !price) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  let productImageUrl = null;
  if (req.files?.productImage?.[0]) {
    const uploadedFile = await S3UploadHelper.uploadFile(req.files.productImage[0], "factory/products");
    productImage = uploadedFile.key; // only string
  }


  const product = await FactoryProduct.create({
    factoryID,
    productName,
    productDescription,
    productCategory,
    price,
    quantity,
    productImage: productImageUrl,
  });

  res.status(201).json({
    success: true,
    message: "Factory product created successfully",
    data: product,
  });
});

// 🟡 Update Factory Product
// 🟡 Update Factory Product
export const updateFactoryProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await FactoryProduct.findById(id);
  if (!product) 
    return res.status(404).json({ success: false, message: "Product not found" });

  // ✅ Handle new product image
  if (req.file) {
    if (product.productImage) {
      await S3UploadHelper.deleteFile(product.productImage); // delete old file
    }
    const uploadedFile = await S3UploadHelper.uploadFile(req.file, "factory/products");
    product.productImage = uploadedFile.key; // store only the key as string
  }

  // ✅ Update other fields (store-style)
  product.productName = req.body.productName || product.productName;
  product.productDescription = req.body.productDescription || product.productDescription;
  product.productCategory = req.body.productCategory || product.productCategory; // must be string
  product.price = req.body.price || product.price;
  product.quantity = req.body.quantity || product.quantity;
  product.status = req.body.status || product.status;

  await product.save();

  res.status(200).json({ success: true, message: "Product updated successfully", data: product });
});

// 🔴 Delete Factory Product
export const deleteFactoryProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await FactoryProduct.findById(id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  if (product.productImage) await S3UploadHelper.deleteFile(product.productImage);
  await product.deleteOne();

  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

// 🟢 Get All Factory Products
export const getAllFactoryProducts = asyncHandler(async (req, res) => {
  const products = await FactoryProduct.find()
    .populate("factoryID", "factoryName")
    .populate("productCategory", "name");

  res.status(200).json({ success: true, message: "All factory products fetched", data: products });
});

// 🟢 Get Factory Product By ID
export const getFactoryProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await FactoryProduct.findById(id)
    .populate("factoryID", "factoryName")
    .populate("productCategory", "name");

  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true, data: product });
});

// 🟣 Admin: Approve / Reject Factory Product
export const changeFactoryProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" | "rejected"

  const product = await FactoryProduct.findById(id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  product.status = status;
  await product.save();

  res.status(200).json({ success: true, message: `Product ${status} successfully`, data: product });
});

// ✅ Factory: View own transactions only
export const viewOwnTransactions = asyncHandler(async (req, res) => {
  const factoryId = req.user._id; // logged-in factory admin

  // Fetch only this factory's transactions
  const transactions = await FactoryTransaction.find({ factoryId }).populate(
    "userId",
    "userName userEmail"
  );

  res.status(200).json(
    new ApiResponse(200, transactions, "Factory transactions retrieved successfully")
  );
});