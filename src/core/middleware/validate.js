// src/core/middleware/validate.js
import { ZodError } from "zod";

export const validate = (schema) => async (req, res, next) => {
  try {
    // ✅ Ensure req.body always exists
    if (!req.body || typeof req.body !== "object") req.body = {};

    // ✅ Try parsing any JSON strings in form-data
    for (const key in req.body) {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch {
        // not JSON → ignore
      }
    }

    // ✅ Run validation
    const result = schema.safeParse(req.body);

    // ✅ Defensive check — ensure result is valid
    if (!result || typeof result !== "object" || result.success === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid validation schema result",
      });
    }

    // ✅ Handle validation errors safely
    if (!result.success) {
      const formattedErrors =
        result.error?.errors?.map((err) => ({
          field: err?.path?.join(".") || "unknown",
          message: err?.message || "Invalid input",
        })) || [];

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }

    // ✅ Pass validated data
    req.body = result.data;
    next();
  } catch (err) {
    console.error("Unexpected validation error:", err);
    return res.status(500).json({
      success: false,
      message: "Unexpected validation error",
      errors: [{ message: err?.message || "Unknown error" }],
    });
  }
};

