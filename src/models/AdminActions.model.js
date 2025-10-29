import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    actionType: {
      type: String,
      enum: [
        "VerifyStore", "RejectStore", "SuspendStore", "BlockStore",
        "VerifyProduct", "RejectProduct",
        "VerifyFactory", "RejectFactory", "SuspendFactory", "BlockFactory",
        "VerifyFactoryProduct", "RejectFactoryProduct",
      ],
      required: true,
    },
    targetTable: {
      type: String,
      enum: ["Store", "StoreProduct", "Factory", "FactoryProduct"],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    notes: { type: String },
    actionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("AdminActions", adminActionSchema);
