import { asyncHandler } from "../../core/utils/async-handler.js";
import StoreFeedback from "../../models/StoreFeedback.js";

// 🟢 Add Store Feedback
export const addStoreFeedback = asyncHandler(async (req, res) => {
  const { storeID, message, rating } = req.body;
  const userID = req.user._id;

  const feedback = await StoreFeedback.create({ userID, storeID, message, rating });
  res.status(201).json({ success: true, message: "Store feedback submitted", feedback });
});

// 🟡 View Store Feedback
export const viewStoreFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params; // storeID
  const feedbacks = await StoreFeedback.find({ storeID: id }).populate("userID", "userName");
  res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
});
