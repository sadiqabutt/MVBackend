import mongoose from "mongoose";

const storeProductCategorySchema = new mongoose.Schema(
  {
    storeID: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("StoreProductCategory", storeProductCategorySchema);
