import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import {
  performAdminAction,
  getAllEntities,
  getAllAdminActions,
  viewAllTransactions,
  viewAllReviews,
  placeOrderForUser,
  viewOwnStoreTransactions,
  giveFactoryFeedback,
  viewAllStoresAndProducts,
  placeFactoryOrder,
} from "./adminActions.controller.js";

const router = express.Router();

router.post("/action", isLoggedIn, performAdminAction);
router.get("/entities", isLoggedIn, getAllEntities);
router.get("/actions", isLoggedIn, getAllAdminActions);
router.get("/transactions", isLoggedIn, viewAllTransactions);
router.get("/reviews", isLoggedIn, viewAllReviews);
router.post("/order", isLoggedIn, placeOrderForUser);
// ✅ 1. View Stores / Products
router.get("/view", viewAllStoresAndProducts);

// ✅ 3. Review / Feedback (Factory)
router.post("/buyer/factory/feedback", isLoggedIn, giveFactoryFeedback);

// ✅ 4. View Own Store Transactions
router.get("/buyer/store/transactions", isLoggedIn, viewOwnStoreTransactions);
// ✅ 2. Place Order (Factory)
router.post("/buyer/factory/order", isLoggedIn, placeFactoryOrder);

export default router;
