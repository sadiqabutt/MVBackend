import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeLogo: {
      type: String,
      default: null,
    },
    storeCoverImage: {
      type: String,
      default: null,
    },
    storeDescription: {
      type: String,
      default: "",
    },
    storeCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      default: null,
    },
    idCardNumber: {
      type: String,
      required: true,
      trim: true,
    },
    idCardImage: {
      type: String,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    storeStatus: {
      type: String,
      enum: ["pending", "live", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
