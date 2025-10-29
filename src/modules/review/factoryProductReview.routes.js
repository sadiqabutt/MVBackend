import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { addFactoryProductReview, viewFactoryProductReviews } from "./factoryProductReview.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, addFactoryProductReview);
router.get("/view/:id", viewFactoryProductReviews);

export default router;
