import { Router } from "express";
import { getFamilySummaries } from "../controllers/familySummaryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/:roomId", getFamilySummaries);

export default router;
