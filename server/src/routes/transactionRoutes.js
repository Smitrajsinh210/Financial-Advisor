import { Router } from "express";
import { body } from "express-validator";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.use(protect);

router.route("/").get(getTransactions).post(
  [
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("date").optional().isISO8601().withMessage("Date must be valid")
  ],
  validateRequest,
  createTransaction
);

router.route("/:id").put(
  [
    body("type").optional().isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be greater than 0")
  ],
  validateRequest,
  updateTransaction
).delete(deleteTransaction);

export default router;
