
import mongoose from "mongoose";

const factoryProductSchema = new mongoose.Schema(
  {
    factoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productDescription: {
      type: String,
      default: "",
    },
    productCategory: {
      type: String, // ✅ now string like storeProduct
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    productImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FactoryProduct", factoryProductSchema);
