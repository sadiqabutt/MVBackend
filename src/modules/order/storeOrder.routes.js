import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { placeStoreOrder, viewStoreOrders } from "./storeOrder.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, placeStoreOrder);
router.get("/history", isLoggedIn, viewStoreOrders);

export default router;
