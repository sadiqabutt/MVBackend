
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/core/middleware/errorHandler.js";

// ✅ Auth & User
import authRouter from "./src/modules/auth/auth.route.js";
import userRouter from "./src/modules/user/user.route.js";

// ✅ Admin
import adminRouter from "./src/modules/admin/admin.route.js";
import adminActionsRoutes from "./src/modules/admin/adminActions.route.js";

// ✅ Store & Store Products
import storeRoutes from "./src/modules/store/store.routes.js";
import storeProductRoutes from "./src/modules/store/storeProduct.routes.js";

// ✅ Factory & Factory Products
import factoryRoutes from "./src/modules/factory/factory.routes.js";
import factoryProductRoutes from "./src/modules/factory/factoryProduct.routes.js";

// ✅ Orders
import storeOrderRoutes from "./src/modules/order/storeOrder.routes.js";
import factoryOrderRoutes from "./src/modules/order/factoryOrder.routes.js";

// ✅ Feedback & Reviews
import storeFeedbackRoutes from "./src/modules/feedback/storeFeedback.routes.js";
import storeProductReviewRoutes from "./src/modules/review/storeProductReview.routes.js";
import factoryFeedbackRoutes from "./src/modules/feedback/factoryFeedback.routes.js";
import factoryProductReviewRoutes from "./src/modules/review/factoryProductReview.routes.js";

// ✅ Categories
import categoryRoutes from "./src/modules/category/category.route.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------
// Routes
// --------------------

// Auth & Users fsw cx 
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

// Admin
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/actions", adminActionsRoutes);

// Store & Store Products
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/store-products", storeProductRoutes);

// Factory & Factory Products
app.use("/api/v1/factories", factoryRoutes);
app.use("/api/v1/factory-products", factoryProductRoutes);

// Orders
app.use("/api/v1/orders/store", storeOrderRoutes);
app.use("/api/v1/orders/factory", factoryOrderRoutes);

// Feedback & Reviews
app.use("/api/v1/store-feedback", storeFeedbackRoutes);
app.use("/api/v1/store-product-review", storeProductReviewRoutes);
app.use("/api/v1/factory-feedback", factoryFeedbackRoutes);
app.use("/api/v1/factory-product-review", factoryProductReviewRoutes);

// Categories
app.use("/api/v1/categories", categoryRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
