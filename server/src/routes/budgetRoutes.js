import { Router } from "express";
import { body } from "express-validator";
import { createBudget, deleteBudget, getBudgets } from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.use(protect);
router.route("/").get(getBudgets).post(
  [
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("monthlyLimit").isFloat({ gt: 0 }).withMessage("Monthly limit must be greater than 0")
  ],
  validateRequest,
  createBudget
);

router.delete("/:id", deleteBudget);

export default router;
