import StoreProduct from "../../models/StoreProduct.js";
import Store from "../../models/Store.model.js";
import Product from "../../models/product.model.js";
import StoreProductCategory from "../../models/StoreProductCategory.js"; // ✅ Added
import StoreOrder from "../../models/StoreOrder.js"; // ✅ Added
import StoreFeedback from "../../models/StoreFeedback.js"; // ✅ Added
import FactoryFeedback from "../../models/FactoryFeedback.js"; // ✅ Added
import StoreTransaction from "../../models/StoreTransaction.js"; // ✅ Added
import FactoryOrder from "../../models/FactoryOrder.js";

import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { ApiError } from "../../core/utils/api-error.js";


// =====================================================
// 🟢 CREATE STORE PRODUCT
// =====================================================
export const createProduct = asyncHandler(async (req, res) => {
  const { storeID, productName, productDescription, productCategory, price, quantity } = req.body;

  if (!storeID || !productName || !price)
    throw new ApiError(400, "Missing required fields");

  const storeExists = await Store.findById(storeID);
  if (!storeExists) throw new ApiError(404, "Store not found");

  // ✅ Upload image (if provided)
  let productImageKey = null;
  if (req.file) {
    const uploaded = await S3UploadHelper.uploadFile(req.file, "store/products");
    productImageKey = uploaded.key;
  }
const storeProduct = await StoreProduct.create({
  storeID: req.body.storeID,
  productName: req.body.productName,
  productDescription: req.body.productDescription,
  productCategory: req.body.productCategory, // ✅ flat
  price: req.body.price,
  quantity: req.body.quantity,
  productImage: req.file?.path,
});

  // ✅ Create unified Product entry
  await Product.create({
    productType: "store",
    productTypeRef: "StoreProduct",
    productRef: storeProduct._id,
    name: productName,
    description: productDescription,
    price,
    category: productCategory,
    image: productImageKey,
  });


  res.status(201).json(
    new ApiResponse(201, storeProduct, "Store product created successfully")
  );
});


// =====================================================
// 🟡 UPDATE STORE PRODUCT
// =====================================================
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await StoreProduct.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (req.file) {
    if (product.productImage) await S3UploadHelper.deleteFile(product.productImage);
    const uploaded = await S3UploadHelper.uploadFile(req.file, "store/products");
    product.productImage = uploaded.key;
  }

  Object.assign(product, req.body);
  await product.save();

  await Product.findOneAndUpdate(
    { productRef: product._id },
    {
      name: product.productName,
      description: product.productDescription,
      price: product.price,
      category: product.productCategory,
      image: product.productImage,
    }
  );

  res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});


// =====================================================
// 🔴 DELETE STORE PRODUCT
// =====================================================
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await StoreProduct.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.productImage) await S3UploadHelper.deleteFile(product.productImage);

  await Product.findOneAndDelete({ productRef: product._id });
  await product.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});


// =====================================================
// 🟢 GET ALL STORE PRODUCTS
// =====================================================
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await StoreProduct.find()
    .populate("storeID", "storeName")
    .populate("productCategory", "categoryName");

  res.status(200).json(new ApiResponse(200, products, "All store products fetched"));
});


// =====================================================
// 🟢 GET SINGLE PRODUCT
// =====================================================
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await StoreProduct.findById(id)
    .populate("storeID", "storeName")
    .populate("productCategory", "categoryName");

  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, product, "Product fetched"));
});


// =====================================================
// 🟣 ADMIN: APPROVE / REJECT PRODUCT
// =====================================================
export const changeProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" | "rejected"
  const product = await StoreProduct.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  product.status = status;
  await product.save();
  res.status(200).json(new ApiResponse(200, product, `Product ${status} successfully`));
});


// =====================================================
// 🆕 EXTRA FEATURES for STORE ADMIN
// =====================================================

// 🟢 Get Store’s Own Orders
export const getStoreOrders = asyncHandler(async (req, res) => {
  const storeID = req.params.storeID;
  const orders = await StoreOrder.find({ storeID }).populate("customerID", "userName userEmail");
  res.status(200).json(new ApiResponse(200, orders, "Store orders fetched successfully"));
});

// 🟡 Update Order Status (Processing → Delivered)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderID } = req.params;
  const { status } = req.body;
  const order = await StoreOrder.findById(orderID);
  if (!order) throw new ApiError(404, "Order not found");
  order.status = status;
  await order.save();
  res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

// 🟢 Get Store Feedbacks
export const getStoreFeedbacks = asyncHandler(async (req, res) => {
  const storeID = req.params.storeID;
  const feedbacks = await StoreFeedback.find({ storeID });
  res.status(200).json(new ApiResponse(200, feedbacks, "Store feedback fetched"));
});

// 🟢 Get Store Reviews
export const getStoreReviews = asyncHandler(async (req, res) => {
  const storeID = req.params.storeID;
  const reviews = await StoreFeedback.find({ storeID }).populate("userID", "userName");
  res.status(200).json(new ApiResponse(200, reviews, "Store reviews fetched"));
});

// 🟡 Send Feedback to Factory
export const sendFeedbackToFactory = asyncHandler(async (req, res) => {
  const { storeID, factoryID, message, rating } = req.body;
  if (!storeID || !factoryID || !message)
    throw new ApiError(400, "Missing required fields");
  const feedback = await FactoryFeedback.create({ storeID, factoryID, message, rating });
  res.status(201).json(new ApiResponse(201, feedback, "Feedback sent to factory"));
});

// 🟢 Order from Factory
export const createFactoryOrder = asyncHandler(async (req, res) => {
  const { storeID, factoryID, productID, quantity, totalAmount } = req.body;
  if (!storeID || !factoryID || !productID)
    throw new ApiError(400, "Missing required fields");
  const order = await StoreOrder.create({ storeID, factoryID, productID, quantity, totalAmount, status: "pending" });
  res.status(201).json(new ApiResponse(201, order, "Factory order placed successfully"));
});

// 🟢 Get Store Transaction History
export const getStoreTransactions = asyncHandler(async (req, res) => {
  const storeID = req.params.storeID;
  const transactions = await StoreTransaction.find({ storeID });
  res.status(200).json(new ApiResponse(200, transactions, "Store transactions fetched"));
});

// ✅ View own store transactions
export const viewOwnTransactions = asyncHandler(async (req, res) => {
  const storeId = req.user._id; // logged-in store-admin
  const transactions = await StoreTransaction.find({ storeId }).populate(
    "userId",
    "userName userEmail"
  );

  res.status(200).json(
    new ApiResponse(200, transactions, "Store transactions retrieved successfully")
  );
});

// ✅ Give feedback (to factory only)
export const giveFeedback = asyncHandler(async (req, res) => {
  const { targetId, message } = req.body;
  const storeId = req.user._id;

  if (!targetId || !message) throw new ApiError(400, "targetId and message required");

  const feedback = await FactoryFeedback.create({
    userId: storeId, // store-admin giving feedback
    targetId,        // factory ID
    message,
  });

  res.status(201).json(
    new ApiResponse(201, feedback, "Feedback submitted successfully")
  );
});

// ✅ Place order to a factory
export const placeOrder = asyncHandler(async (req, res) => {
  const { productID, quantity, totalAmount, factoryID } = req.body;
  const storeId = req.user._id;

  if (!productID || !quantity || !totalAmount || !factoryID) 
    throw new ApiError(400, "All fields are required");

  const order = await FactoryOrder.create({
    userID: storeId,   // store placing order
    factoryID,         // target factory
    productID,
    quantity,
    totalAmount,
    status: "pending",
  });

  res.status(201).json(
    new ApiResponse(201, order, "Order placed successfully to factory")
  );
});