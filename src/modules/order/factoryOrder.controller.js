import FactoryOrder from "../../models/FactoryOrder.js";
import FactoryProduct from "../../models/FactoryProduct.js";
import FactoryTransaction from "../../models/FactoryTransaction.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import crypto from "crypto";

// 🟢 Place Factory Order
export const placeFactoryOrder = asyncHandler(async (req, res) => {
  const { factoryID, productID, quantity, paymentMethod } = req.body;
  const userID = req.user._id;

  const product = await FactoryProduct.findById(productID);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const totalAmount = product.price * quantity;
  const order = await FactoryOrder.create({ userID, factoryID, productID, quantity, totalAmount });

  const transaction = await FactoryTransaction.create({
    orderID: order._id,
    userID,
    paymentMethod,
    paymentStatus: "success",
    amount: totalAmount,
    transactionID: crypto.randomBytes(8).toString("hex"),
  });

  order.status = "paid";
  await order.save();

  res.status(201).json({ success: true, message: "Factory order placed successfully", order, transaction });
});

// 🟡 View Factory Orders
export const viewFactoryOrders = asyncHandler(async (req, res) => {
  const userID = req.user._id;

  const factoryOrders = await FactoryOrder.find({ userID })
    .populate("factoryID", "factoryName")
    .populate("productID", "productName price");

  res.status(200).json({ success: true, factoryOrders });
});
