import mongoose from "mongoose";

const factoryOrderSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    factoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: "FactoryProduct", required: true },
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

export default mongoose.model("FactoryOrder", factoryOrderSchema);
