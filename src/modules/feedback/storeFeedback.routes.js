import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { addStoreFeedback, viewStoreFeedback } from "./storeFeedback.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, addStoreFeedback);
router.get("/view/:id", viewStoreFeedback);

export default router;
