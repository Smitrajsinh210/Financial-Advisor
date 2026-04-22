import { Router } from "express";
import { deleteUser, getAdminOverview } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/overview", getAdminOverview);
router.delete("/users/:id", deleteUser);

export default router;
