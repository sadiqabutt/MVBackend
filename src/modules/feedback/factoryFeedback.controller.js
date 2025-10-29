import { asyncHandler } from "../../core/utils/async-handler.js";
import FactoryFeedback from "../../models/FactoryFeedback.js";

// 🟢 Add Factory Feedback
export const addFactoryFeedback = asyncHandler(async (req, res) => {
  const { factoryID, message, rating } = req.body;
  const userID = req.user._id;

  const feedback = await FactoryFeedback.create({ userID, factoryID, message, rating });
  res.status(201).json({ success: true, message: "Factory feedback submitted", feedback });
});

// 🟡 View Factory Feedback
export const viewFactoryFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params; // factoryID
  const feedbacks = await FactoryFeedback.find({ factoryID: id }).populate("userID", "userName");
  res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
});
