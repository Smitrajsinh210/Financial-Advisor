import { Router } from "express";
import { getReminders, markReminderAsRead } from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getReminders);
router.patch("/:id/read", markReminderAsRead);

export default router;
