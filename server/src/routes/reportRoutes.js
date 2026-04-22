import { Router } from "express";
import { emailMonthlySummary, exportCsv, exportPdf, getDashboardReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/dashboard", getDashboardReport);
router.get("/export/csv", exportCsv);
router.get("/export/pdf", exportPdf);
router.post("/email-summary", emailMonthlySummary);

export default router;
