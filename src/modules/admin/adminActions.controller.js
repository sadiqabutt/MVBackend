

import { asyncHandler } from "../../core/utils/async-handler.js";
import AdminActions from "../../models/AdminActions.model.js";
import Store from "../../models/Store.model.js";
import StoreProduct from "../../models/StoreProduct.js";
import Factory from "../../models/Factory.js";
import FactoryProduct from "../../models/FactoryProduct.js";
import User from "../../models/User.model.js";

// 💰 Transactions
import StoreTransaction from "../../models/StoreTransaction.js";
import FactoryTransaction from "../../models/FactoryTransaction.js";

// ⭐ Feedbacks / Reviews
import StoreFeedback from "../../models/StoreFeedback.js";
import FactoryFeedback from "../../models/FactoryFeedback.js";

// 🛒 Orders
import StoreOrder from "../../models/StoreOrder.js";
import FactoryOrder from "../../models/FactoryOrder.js";


// 🧾 Utility to record admin actions
const recordAction = async (adminId, type, table, targetId, notes) => {
  await AdminActions.create({
    adminId,
    actionType: type,
    targetTable: table,
    targetId,
    notes,
  });
};


// ✅ Verify / Reject / Suspend / Block entity
export const performAdminAction = asyncHandler(async (req, res) => {
  const { targetType, targetId, actionType, notes } = req.body;
  const adminId = req.user._id;

  let targetModel;
  switch (targetType) {
    case "Store": targetModel = Store; break;
    case "StoreProduct": targetModel = StoreProduct; break;
    case "Factory": targetModel = Factory; break;
    case "FactoryProduct": targetModel = FactoryProduct; break;
    case "User": targetModel = User; break;
    default:
      res.status(400);
      throw new Error("Invalid target type");
  }

  const target = await targetModel.findById(targetId);
  if (!target) {
    res.status(404);
    throw new Error(`${targetType} not found`);
  }

  // Apply action
  if (actionType.includes("Reject")) target.status = "rejected";
  else if (actionType.includes("Verify") || actionType.includes("Approve")) target.status = "live";
  else if (actionType.includes("Suspend")) target.isSuspended = true;
  else if (actionType.includes("Block")) target.isBlocked = true;

  await target.save();
  await recordAction(adminId, actionType, targetType, targetId, notes);

  res.status(200).json({
    success: true,
    message: `Action '${actionType}' applied successfully on ${targetType}`,
    target,
  });
});


// 👁️ View all entities (Users, Stores, Factories, Products)
export const getAllEntities = asyncHandler(async (req, res) => {
  const users = await User.find().select("-userPassword");
  const stores = await Store.find();
  const factories = await Factory.find();
  const storeProducts = await StoreProduct.find();
  const factoryProducts = await FactoryProduct.find();

  res.status(200).json({
    success: true,
    users,
    stores,
    factories,
    storeProducts,
    factoryProducts,
  });
});


// 📜 View all admin actions
export const getAllAdminActions = asyncHandler(async (req, res) => {
  const actions = await AdminActions.find().populate("adminId", "adminName adminEmail");
  res.status(200).json({
    success: true,
    count: actions.length,
    actions,
  });
});


// 💰 View all transactions (Store + Factory)
export const viewAllTransactions = asyncHandler(async (req, res) => {
  const storeTx = await StoreTransaction.find().populate("userId", "userName userEmail");
  const factoryTx = await FactoryTransaction.find().populate("userId", "userName userEmail");

  res.status(200).json({
    success: true,
    storeTransactions: storeTx,
    factoryTransactions: factoryTx,
  });
});


// ⭐ View all reviews / feedbacks (Store + Factory)
export const viewAllReviews = asyncHandler(async (req, res) => {
  const storeReviews = await StoreFeedback.find()
    .populate("userId", "userName")
    .populate("productId", "productName");

  const factoryReviews = await FactoryFeedback.find()
    .populate("userId", "userName")
    .populate("productId", "productName");

  res.status(200).json({
    success: true,
    storeReviews,
    factoryReviews,
  });
});


// 🛒 Place order manually (Super Admin only)
export const placeOrderForUser = asyncHandler(async (req, res) => {
  const { userId, productId, quantity, totalPrice, notes, orderType } = req.body;
  const adminId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let order;
  if (orderType === "Store") {
    order = await StoreOrder.create({
      userId,
      productId,
      quantity,
      totalPrice,
      placedBy: "superAdmin",
      notes,
    });
  } else if (orderType === "Factory") {
    order = await FactoryOrder.create({
      userId,
      productId,
      quantity,
      totalPrice,
      placedBy: "superAdmin",
      notes,
    });
  } else {
    throw new Error("Invalid order type. Use 'Store' or 'Factory'.");
  }

  await recordAction(
    adminId,
    "PlaceOrder",
    orderType + "Order",
    order._id,
    `Order placed by admin for user ${user.userName}`
  );

  res.status(201).json({
    success: true,
    message: `Order placed successfully by Super Admin for ${orderType}`,
    order,
  });
});


// ✅ View all Stores & Products
export const viewAllStoresAndProducts = asyncHandler(async (req, res) => {
  const stores = await Store.find();
  const storeProducts = await StoreProduct.find().populate("storeID", "storeName");
  const factoryProducts = await FactoryProduct.find().populate("factoryID", "factoryName");

  res.json(
    new ApiResponse(200, { stores, storeProducts, factoryProducts }, "Stores and products retrieved successfully")
  );
});

// ✅ Place Factory Order
export const placeFactoryOrder = asyncHandler(async (req, res) => {
  const { factoryID, productID, quantity, totalAmount } = req.body;
  const userID = req.user._id;

  if (!factoryID || !productID || !quantity || !totalAmount)
    throw new ApiError(400, "All fields are required");

  const order = await FactoryOrder.create({
    userID,
    factoryID,
    productID,
    quantity,
    totalAmount,
  });

  res.json(new ApiResponse(201, order, "Factory order placed successfully"));
});

// ✅ Give feedback to Factory
export const giveFactoryFeedback = asyncHandler(async (req, res) => {
  const { factoryID, message } = req.body;
  const userID = req.user._id;

  if (!factoryID || !message) throw new ApiError(400, "All fields are required");

  const feedback = await FactoryFeedback.create({ userID, factoryID, message });
  res.json(new ApiResponse(201, feedback, "Feedback submitted successfully"));
});

// ✅ View own Store Transactions
export const viewOwnStoreTransactions = asyncHandler(async (req, res) => {
  const userID = req.user._id;
  const transactions = await StoreTransaction.find({ userID }).populate("storeID", "storeName");

  res.json(new ApiResponse(200, transactions, "Your store transactions retrieved successfully"));
});