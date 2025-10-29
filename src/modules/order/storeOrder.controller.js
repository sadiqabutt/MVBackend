import StoreOrder from "../../models/StoreOrder.js";
import StoreProduct from "../../models/StoreProduct.js";
import StoreTransaction from "../../models/StoreTransaction.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import crypto from "crypto";

// 🟢 Place Store Order
export const placeStoreOrder = asyncHandler(async (req, res) => {
  const { storeID, productID, quantity, paymentMethod } = req.body;
  const userID = req.user._id;

  const product = await StoreProduct.findById(productID);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const totalAmount = product.price * quantity;
  const order = await StoreOrder.create({ userID, storeID, productID, quantity, totalAmount });

  // Simulate payment
  const transaction = await StoreTransaction.create({
    orderID: order._id,
    userID,
    paymentMethod,
    paymentStatus: "success",
    amount: totalAmount,
    transactionID: crypto.randomBytes(8).toString("hex"),
  });

  order.status = "paid";
  await order.save();

  res.status(201).json({ success: true, message: "Store order placed successfully", order, transaction });
});

// 🟡 View Store Orders
export const viewStoreOrders = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const storeOrders = await StoreOrder.find({ userID })
    .populate("storeID", "storeName")
    .populate("productID", "productName price");

  res.status(200).json({ success: true, storeOrders });
});
