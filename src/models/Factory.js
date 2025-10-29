import mongoose from "mongoose";

const factorySchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    factoryName: {
      type: String,
      required: true,
      trim: true,
    },
    factoryLogo: {
      type: String,
      default: null,
    },
    factoryLicenseImage: {
      type: String,
      default: null,
    },
    factoryDescription: {
      type: String,
      default: "",
    },
    factoryCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      default: null,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    factoryStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Factory", factorySchema);
