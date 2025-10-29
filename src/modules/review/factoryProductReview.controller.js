import { asyncHandler } from "../../core/utils/async-handler.js";
import FactoryProductReview from "../../models/FactoryProductReview.js";

// 🟢 Add Factory Product Review
export const addFactoryProductReview = asyncHandler(async (req, res) => {
  const { factoryProductID, rating, comment } = req.body;
  const userID = req.user._id;

  const review = await FactoryProductReview.create({ userID, factoryProductID, rating, comment });
  res.status(201).json({ success: true, message: "Factory product review added successfully", review });
});

// 🟡 View Factory Product Reviews
export const viewFactoryProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params; // factoryProductID
  const reviews = await FactoryProductReview.find({ factoryProductID: id }).populate("userID", "userName");
  res.status(200).json({ success: true, count: reviews.length, reviews });
});
