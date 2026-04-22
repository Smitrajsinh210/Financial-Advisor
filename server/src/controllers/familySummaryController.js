import { getAll } from "../config/db.js";
import {
  ensureRoomMember,
  mapMonthlySummary,
  recalculateRoomSummaries
} from "../services/familySummaryService.js";

export const getFamilySummaries = async (req, res, next) => {
  try {
    const roomId = Number(req.params.roomId);
    ensureRoomMember(roomId, req.user.id);
    recalculateRoomSummaries(roomId);

    const summaries = getAll(
      `SELECT * FROM monthly_summaries WHERE roomId = ? ORDER BY month DESC`,
      [roomId]
    ).map(mapMonthlySummary);

    res.json({ success: true, data: summaries });
  } catch (error) {
    next(error);
  }
};
