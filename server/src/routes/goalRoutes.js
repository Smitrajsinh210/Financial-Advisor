import { Router } from "express";
import { body } from "express-validator";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.use(protect);
router.route("/").get(getGoals).post(
  [
    body("title").trim().notEmpty().withMessage("Goal title is required"),
    body("targetAmount").isFloat({ gt: 0 }).withMessage("Target amount must be greater than 0"),
    body("savedAmount").optional().isFloat({ min: 0 }).withMessage("Saved amount cannot be negative"),
    body("deadline").isISO8601().withMessage("Deadline must be a valid date")
  ],
  validateRequest,
  createGoal
);

router.route("/:id").put(validateRequest, updateGoal).delete(deleteGoal);

export default router;
