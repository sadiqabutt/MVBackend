import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      enum: ["store", "factory"],
      required: true,
    },
    productRef: {
      // references either StoreProduct or FactoryProduct
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "productTypeRef",
    },
    productTypeRef: {
      // dynamic reference path
      type: String,
      required: true,
      enum: ["StoreProduct", "FactoryProduct"],
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    image: { type: String, default: null },
    category: {
     productCategory: {
  type: String,
  required: true
}

    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
