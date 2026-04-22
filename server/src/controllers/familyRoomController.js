import { getAll, getOne, run } from "../config/db.js";
import {
  calculateLiveRoomSummary,
  ensureRoomMember,
  mapMonthlySummary
} from "../services/familySummaryService.js";

const generateJoinCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${segment()}-${segment()}-${segment()}`;
};

const createUniqueJoinCode = () => {
  let joinCode = generateJoinCode();
  while (getOne(`SELECT id FROM family_rooms WHERE joinCode = ?`, [joinCode])) {
    joinCode = generateJoinCode();
  }
  return joinCode;
};

const ensureRoomJoinCode = (room) => {
  if (room?.joinCode) return room;
  const joinCode = createUniqueJoinCode();
  run(`UPDATE family_rooms SET joinCode = ? WHERE id = ?`, [joinCode, room.id]);
  return { ...room, joinCode };
};

const mapRoom = (row) => ({
  ...row,
  _id: Number(row.id),
  createdBy: Number(row.createdBy)
});

export const listFamilyRooms = async (req, res, next) => {
  try {
    const rooms = getAll(
      `SELECT fr.*
       FROM family_rooms fr
       JOIN family_room_members frm ON frm.roomId = fr.id
       WHERE frm.userId = ?
       ORDER BY datetime(fr.createdAt) DESC, fr.id DESC`,
      [req.user.id]
    )
      .map(ensureRoomJoinCode)
      .map(mapRoom);

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const createFamilyRoom = async (req, res, next) => {
  try {
    const joinCode = createUniqueJoinCode();
    const result = run(
      `INSERT INTO family_rooms (name, createdBy, joinCode, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [req.body.name, req.user.id, joinCode]
    );
    run(
      `INSERT INTO family_room_members (roomId, userId, joinedAt) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [result.lastInsertRowid, req.user.id]
    );

    const room = mapRoom(ensureRoomJoinCode(getOne(`SELECT * FROM family_rooms WHERE id = ?`, [result.lastInsertRowid])));
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const joinFamilyRoom = async (req, res, next) => {
  try {
    const room = getOne(`SELECT * FROM family_rooms WHERE joinCode = ?`, [req.body.joinCode.trim().toUpperCase()]);

    if (!room) {
      const error = new Error("Family room not found for this join code");
      error.statusCode = 404;
      throw error;
    }

    run(
      `INSERT INTO family_room_members (roomId, userId, joinedAt)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(roomId, userId) DO NOTHING`,
      [room.id, req.user.id]
    );

    res.json({ success: true, data: mapRoom(ensureRoomJoinCode(room)) });
  } catch (error) {
    next(error);
  }
};

export const getFamilyRoom = async (req, res, next) => {
  try {
    const roomId = Number(req.params.roomId);
    ensureRoomMember(roomId, req.user.id);

    const room = mapRoom(ensureRoomJoinCode(getOne(`SELECT * FROM family_rooms WHERE id = ?`, [roomId])));
    const members = getAll(
      `SELECT u.id, u.name, u.email, frm.joinedAt
       FROM family_room_members frm
       JOIN users u ON u.id = frm.userId
       WHERE frm.roomId = ?
       ORDER BY u.name ASC`,
      [roomId]
    );
    const liveSummary = calculateLiveRoomSummary(roomId);
    const latestSummary = getAll(
      `SELECT * FROM monthly_summaries WHERE roomId = ? ORDER BY month DESC LIMIT 6`,
      [roomId]
    ).map(mapMonthlySummary);

    res.json({
      success: true,
      data: {
        room,
        members: members.map((member) => ({ ...member, _id: Number(member.id) })),
        liveSummary,
        monthlySummaries: latestSummary
      }
    });
  } catch (error) {
    next(error);
  }
};
