import { asyncHandler } from "../../core/utils/async-handler.js";
import StoreProductReview from "../../models/StoreProductReview.js";

// 🟢 Add Store Product Review
export const addStoreProductReview = asyncHandler(async (req, res) => {
  const { storeProductID, rating, comment } = req.body;
  const userID = req.user._id;

  const review = await StoreProductReview.create({ userID, storeProductID, rating, comment });
  res.status(201).json({ success: true, message: "Store product review added successfully", review });
});

// 🟡 View Store Product Reviews
export const viewStoreProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params; // storeProductID
  const reviews = await StoreProductReview.find({ storeProductID: id }).populate("userID", "userName");
  res.status(200).json({ success: true, count: reviews.length, reviews });
});
