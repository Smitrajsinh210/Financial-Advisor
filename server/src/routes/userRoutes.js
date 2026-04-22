import { Router } from "express";
import { getAllUsers, getProfile, updateProfile } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.get("/", protect, authorize("admin"), getAllUsers);

export default router;
