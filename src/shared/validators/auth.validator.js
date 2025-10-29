import { z } from "zod";

/* =========================
   🧍 USER VALIDATIONS
========================= */

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/;

export const userRegisterSchema = z.object({
  userName: z.string().min(3, "Name must be at least 3 characters long"),
  userEmail: z.string().email("Invalid email"),
  userPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[@$!%*?&]/, "Must contain a special character (@, $, !, %, *, ?, &)"),
  userRole: z.enum(["buyer", "store-admin", "factory-admin"]).default("buyer").optional(),
  phoneNumber: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, "Invalid format").optional(),
});

export const userLoginSchema = z.object({
  userEmail: z.string().email("Invalid email"),
  userPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export const userResetPasswordSchema = z.object({
  userPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[@$!%*?&]/, "Must contain a special character (@, $, !, %, *, ?, &)"),
});

/* =========================
   🧑‍💼 ADMIN VALIDATIONS
========================= */

export const adminRegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  contact_no: z
    .string()
    .regex(/^[+\d]?(?:[\d\-.\s()]*)$/, "Invalid contact number"),
  role: z.enum(["admin", "superadmin"], {
    errorMap: () => ({ message: "Role must be either 'admin' or 'superadmin'" }),
  }),
  status: z.enum(["active", "inactive"]).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export const adminForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
});

export const adminResetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const adminChangePasswordSchema = z.object({
  oldPassword: z.string().nonempty({ message: "Old password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters" }),
});

/* =========================
   ✅ VALIDATION MIDDLEWARE
========================= */

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during validation",
    });
  }
};
