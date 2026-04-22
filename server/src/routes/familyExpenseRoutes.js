import { Router } from "express";
import { body } from "express-validator";
import { addFamilyExpense, getFamilyExpenses } from "../controllers/familyExpenseController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.use(protect);
router.post(
  "/add",
  [
    body("roomId").isInt({ gt: 0 }).withMessage("Valid room ID is required"),
    body("title").trim().notEmpty().withMessage("Expense title is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("date").optional().isISO8601().withMessage("Date must be valid")
  ],
  validateRequest,
  addFamilyExpense
);
router.get("/:roomId", getFamilyExpenses);

export default router;
