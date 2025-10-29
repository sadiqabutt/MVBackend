import User from "../../models/User.model.js";
import StoreProduct from "../../models/StoreProduct.js";
import FactoryProduct from "../../models/FactoryProduct.js";

import StoreProductReview from "../../models/StoreProductReview.js";
import FactoryProductReview from "../../models/FactoryProductReview.js";

import StoreOrder from "../../models/StoreOrder.js";
import FactoryOrder from "../../models/FactoryOrder.js";

import StoreFeedback from "../../models/StoreFeedback.js";
import FactoryFeedback from "../../models/FactoryFeedback.js";

import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { ApiError } from "../../core/utils/api-error.js";

// ✅ Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-userPassword");

  const usersWithAvatars = await Promise.all(
    users.map(async (user) => {
      const u = user.toObject();
      u.profileImage = u.profileImage
        ? await S3UploadHelper.getSignedUrl(u.profileImage)
        : null;
      return u;
    })
  );

  res.json(new ApiResponse(200, usersWithAvatars, "Users retrieved"));
});

// ✅ Create user
export const createUser = asyncHandler(async (req, res) => {
  const { userName, userEmail, userPassword, userRole, phoneNumber } = req.body;
  const existing = await User.findOne({ userEmail });
  if (existing) throw new ApiError(400, "User already exists");

  let avatarKey = null;
  if (req.file) {
    const uploaded = await S3UploadHelper.uploadFile(req.file, "avatars");
    avatarKey = uploaded.key;
  }

  const user = await User.create({
    userName,
    userEmail,
    userPassword,
    userRole,
    phoneNumber,
    profileImage: avatarKey,
  });

  const userObj = user.toObject();
  delete userObj.userPassword;
  userObj.profileImage = avatarKey
    ? await S3UploadHelper.getSignedUrl(avatarKey)
    : null;

  res.status(201).json(new ApiResponse(201, userObj, "User created"));
});

// ✅ Update user profile (name, address, phone, image)
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { userName, userAddress, phoneNumber } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (req.file) {
    if (user.profileImage) await S3UploadHelper.deleteFile(user.profileImage);
    const uploaded = await S3UploadHelper.uploadFile(req.file, "user-profiles");
    user.profileImage = uploaded.key;
  }

  if (userName) user.userName = userName;
  if (userAddress) user.userAddress = userAddress;
  if (phoneNumber) user.phoneNumber = phoneNumber;

  await user.save();

  const updatedProfile = user.toObject();
  updatedProfile.profileImage = user.profileImage
    ? await S3UploadHelper.getSignedUrl(user.profileImage)
    : null;

  res.json(new ApiResponse(200, updatedProfile, "Profile updated successfully"));
});

// ✅ Update avatar
export const updateUserAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!req.file) throw new ApiError(400, "Avatar required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.profileImage) await S3UploadHelper.deleteFile(user.profileImage);
  const uploaded = await S3UploadHelper.uploadFile(req.file, "avatars");
  user.profileImage = uploaded.key;
  await user.save();

  res.json(
    new ApiResponse(
      200,
      { avatarUrl: await S3UploadHelper.getSignedUrl(uploaded.key) },
      "Avatar updated"
    )
  );
});

// ✅ Delete avatar
export const deleteUserAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.profileImage) await S3UploadHelper.deleteFile(user.profileImage);
  user.profileImage = null;
  await user.save();

  res.json(new ApiResponse(200, null, "Avatar deleted"));
});

// ✅ Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).select("-userPassword");
  if (!user) throw new ApiError(404, "User not found");

  const userObj = user.toObject();
  userObj.profileImage = user.profileImage
    ? await S3UploadHelper.getSignedUrl(user.profileImage)
    : null;

  res.json(new ApiResponse(200, userObj, "Profile retrieved"));
});

// ============================
// 🛍️ Buyer Functions
// ============================

// ✅ View all products (store + factory)
export const viewAllProducts = asyncHandler(async (req, res) => {
  const storeProducts = await StoreProduct.find().populate("storeID");
  const factoryProducts = await FactoryProduct.find().populate("factoryID");

  res.json(
    new ApiResponse(
      200,
      { storeProducts, factoryProducts },
      "All products retrieved successfully"
    )
  );
});


// ✅ Add product review (detect type automatically)
export const addProductReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, productType } = req.body;
  const userId = req.user._id;

  if (!["store", "factory"].includes(productType))
    throw new ApiError(400, "Invalid product type");

  const ReviewModel =
    productType === "store" ? StoreProductReview : FactoryProductReview;

  const existingReview = await ReviewModel.findOne({ userId, productId });
  if (existingReview) throw new ApiError(400, "You already reviewed this product");

  const review = await ReviewModel.create({ userId, productId, rating, comment });
  res.json(new ApiResponse(201, review, "Review added successfully"));
});

// ✅ Give feedback to store/factory
export const giveFeedback = asyncHandler(async (req, res) => {
  const { targetId, targetType, message } = req.body;
  const userId = req.user._id;

  if (!["store", "factory"].includes(targetType))
    throw new ApiError(400, "Invalid target type");

  const FeedbackModel =
    targetType === "store" ? StoreFeedback : FactoryFeedback;

  const feedback = await FeedbackModel.create({
    userId,
    targetId,
    message,
  });

  res.json(new ApiResponse(201, feedback, "Feedback submitted successfully"));
});

// ✅ Place new order (Store or Factory)
export const placeOrder = asyncHandler(async (req, res) => {
  const { orderType, productID, quantity, totalAmount } = req.body;
  const userID = req.user._id;

  if (!["store", "factory"].includes(orderType)) {
    throw new ApiError(400, "Invalid order type");
  }

  if (!productID || !quantity || !totalAmount) {
    throw new ApiError(400, "Missing required fields");
  }

  if (orderType === "store") {
    const product = await StoreProduct.findById(productID);
    if (!product) throw new ApiError(404, "Store product not found");

    const order = await StoreOrder.create({
      userID,
      storeID: product.storeID, // ✅ must exist in StoreProduct model
      productID,
      quantity,
      totalAmount,
      status: "pending", // ✅ lowercase
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Store order placed successfully"));
  }

  if (orderType === "factory") {
    const product = await FactoryProduct.findById(productID);
    if (!product) throw new ApiError(404, "Factory product not found");

    const order = await FactoryOrder.create({
      userID,
      factoryID: product.factoryID,
      productID,
      quantity,
      totalAmount,
      status: "pending",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Factory order placed successfully"));
  }
});

// ✅ Track order status
export const trackOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, orderType } = req.params;

  if (!["store", "factory"].includes(orderType))
    throw new ApiError(400, "Invalid order type");

  const OrderModel = orderType === "store" ? StoreOrder : FactoryOrder;

  const order = await OrderModel.findById(orderId).populate("items.productId");
  if (!order) throw new ApiError(404, "Order not found");

  res.json(new ApiResponse(200, order, "Order status retrieved successfully"));
});

//view transaction
// ✅ View buyer’s own transactions
export const viewOwnTransactions = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const storeOrders = await StoreOrder.find({ userID });
  const factoryOrders = await FactoryOrder.find({ userID });

  res.json(
    new ApiResponse(
      200,
      { storeOrders, factoryOrders },
      "Your transactions retrieved successfully"
    )
  );
});
