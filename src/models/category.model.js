import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, default: null }, // optional image for category
  },
  { timestamps: true }
);

export default mongoose.model("Categories", categorySchema);
