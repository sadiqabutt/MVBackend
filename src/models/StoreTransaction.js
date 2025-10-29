import mongoose from "mongoose";

const storeTransactionSchema = new mongoose.Schema(
  {
    orderID: { type: mongoose.Schema.Types.ObjectId, ref: "StoreOrder", required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: { type: String, enum: ["card", "cod"], default: "cod" },
    paymentStatus: { type: String, enum: ["success", "failed"], default: "success" },
    amount: { type: Number, required: true },
    transactionID: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("StoreTransaction", storeTransactionSchema);
