import { Router } from "express";
import { body } from "express-validator";
import {
  createFamilyRoom,
  getFamilyRoom,
  joinFamilyRoom,
  listFamilyRooms
} from "../controllers/familyRoomController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.use(protect);
router.get("/", listFamilyRooms);
router.post(
  "/create",
  [body("name").trim().notEmpty().withMessage("Room name is required")],
  validateRequest,
  createFamilyRoom
);
router.post(
  "/join",
  [body("joinCode").trim().notEmpty().withMessage("Valid join code is required")],
  validateRequest,
  joinFamilyRoom
);
router.get("/:roomId", getFamilyRoom);

export default router;
