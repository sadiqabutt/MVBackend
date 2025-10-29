import mongoose from "mongoose";

const storeProductSchema = new mongoose.Schema(
  {
    storeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
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
    type: String, // ✅ must be String (not ObjectId)
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
    isBlocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("StoreProduct", storeProductSchema);
