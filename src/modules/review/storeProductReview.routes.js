import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { addStoreProductReview, viewStoreProductReviews } from "./storeProductReview.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, addStoreProductReview);
router.get("/view/:id", viewStoreProductReviews);

export default router;
