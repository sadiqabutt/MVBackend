import mongoose from "mongoose";

const factoryProductCategorySchema = new mongoose.Schema(
  {
    factoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FactoryProductCategory", factoryProductCategorySchema);
