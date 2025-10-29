
// export default authRouter;
import Router from "express";
import { upload } from "../../core/middleware/multer.js";
import { validate } from "../../core/middleware/validate.js";
import {
  userLoginSchema,
  userRegisterSchema,
  userResetPasswordSchema,
} from "../../shared/validators/auth.validator.js";
import {
  forgotPasswordMail,
  getAccessToken,
  logInUser,
  logoutUser,
  registerUser,
  resetPassword,
  verifyUserMail,
} from "./auth.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const authRouter = Router();

/* ============================================================
   ✅ REGISTER USER (with optional profile image upload to S3)
============================================================ */
authRouter.post(
  "/register-user",
  upload.single("profileImage"), // <-- Must match the file field name in Postman
  (req, res, next) => {
    // Convert JSON-like strings to actual objects
    if (req.body && typeof req.body === "object") {
      for (const key in req.body) {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch {
          // leave normal text values as is
        }
      }
    }
    next();
  },
  validate(userRegisterSchema), // ⬅️ Validate AFTER parsing
  registerUser
);

/* ============================================================
   🔐 LOGIN USER
============================================================ */
authRouter.post("/login-user", validate(userLoginSchema), logInUser);

/* ============================================================
   🚪 LOGOUT USER
============================================================ */
authRouter.post("/logout-user", isLoggedIn, logoutUser);

/* ============================================================
   ✉️ VERIFY EMAIL
============================================================ */
authRouter.get("/verify/:token", verifyUserMail);

/* ============================================================
   🔁 GET ACCESS TOKEN
============================================================ */
authRouter.get("/get-access-token", getAccessToken);

/* ============================================================
   🔑 FORGOT PASSWORD MAIL
============================================================ */
authRouter.post("/forgot-password-mail", forgotPasswordMail);

/* ============================================================
   🔒 RESET PASSWORD
============================================================ */
authRouter.post(
  "/reset-password/:token",
  validate(userResetPasswordSchema),
  resetPassword
);

export default authRouter;
