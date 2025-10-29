import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { addFactoryFeedback, viewFactoryFeedback } from "./factoryFeedback.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, addFactoryFeedback);
router.get("/view/:id", viewFactoryFeedback);

export default router;
