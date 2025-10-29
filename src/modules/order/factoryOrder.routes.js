import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { placeFactoryOrder, viewFactoryOrders } from "./factoryOrder.controller.js";

const router = express.Router();

router.post("/", isLoggedIn, placeFactoryOrder);
router.get("/history", isLoggedIn, viewFactoryOrders);

export default router;
