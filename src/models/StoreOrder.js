import mongoose from "mongoose";

const storeOrderSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeID: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: "StoreProduct", required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("StoreOrder", storeOrderSchema);
