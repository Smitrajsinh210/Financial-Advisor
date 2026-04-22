import { Router } from "express";
import { body } from "express-validator";
import { getAdvisorInsights, getChatHistory } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.use(protect);
router.get("/history", getChatHistory);
router.post("/advisor", [body("prompt").optional().isString().withMessage("Prompt must be text")], validateRequest, getAdvisorInsights);

export default router;
