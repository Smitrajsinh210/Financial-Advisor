import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";
import { fileURLToPath } from "url";

const databasePath = process.env.SQLITE_PATH || path.resolve(process.cwd(), "data", "app.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlJsDist = path.resolve(__dirname, "..", "..", "node_modules", "sql.js", "dist");

let db;

const saveDatabase = () => {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(databasePath, Buffer.from(data));
};

const rowFromStatement = (statement) => {
  const row = statement.getAsObject();
  return Object.keys(row).length === 0 ? undefined : row;
};

export const getOne = (query, params = []) => {
  const statement = db.prepare(query);
  statement.bind(params);
  const row = statement.step() ? rowFromStatement(statement) : undefined;
  statement.free();
  return row;
};

export const getAll = (query, params = []) => {
  const statement = db.prepare(query);
  statement.bind(params);
  const rows = [];
  while (statement.step()) {
    rows.push(rowFromStatement(statement));
  }
  statement.free();
  return rows;
};

export const run = (query, params = []) => {
  const before = getOne("SELECT last_insert_rowid() AS id")?.id || 0;
  db.run(query, params);
  const after = getOne("SELECT last_insert_rowid() AS id")?.id || before;
  const changes = getOne("SELECT changes() AS count")?.count || 0;
  saveDatabase();
  return { changes: Number(changes), lastInsertRowid: Number(after) };
};

export const normalizeUser = (row) =>
  row
    ? {
        ...row,
        id: Number(row.id),
        monthlyIncome: Number(row.monthlyIncome || 0),
        emailNotifications: Boolean(row.emailNotifications),
        isActive: Boolean(row.isActive)
      }
    : null;

const initDatabase = async () => {
  if (db) return;
  const SQL = await initSqlJs({
    locateFile: (file) => path.resolve(sqlJsDist, file)
  });
  const buffer = fs.existsSync(databasePath) ? fs.readFileSync(databasePath) : undefined;
  db = buffer ? new SQL.Database(buffer) : new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT DEFAULT '',
      language TEXT NOT NULL DEFAULT 'en',
      currency TEXT NOT NULL DEFAULT 'INR',
      monthlyIncome REAL NOT NULL DEFAULT 0,
      emailNotifications INTEGER NOT NULL DEFAULT 1,
      isActive INTEGER NOT NULL DEFAULT 1,
      resetToken TEXT,
      resetTokenExpiresAt TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT DEFAULT '',
      date TEXT NOT NULL,
      isRecurring INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      category TEXT NOT NULL,
      monthlyLimit REAL NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, category),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      savedAmount REAL NOT NULL DEFAULT 0,
      deadline TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      question TEXT NOT NULL,
      response TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdBy INTEGER NOT NULL,
      joinCode TEXT UNIQUE,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_room_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      joinedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(roomId, userId),
      FOREIGN KEY (roomId) REFERENCES family_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS family_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roomId) REFERENCES family_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS monthly_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      month TEXT NOT NULL,
      totalExpense REAL NOT NULL,
      perUserBreakdown TEXT NOT NULL,
      topCategory TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(roomId, month),
      FOREIGN KEY (roomId) REFERENCES family_rooms(id) ON DELETE CASCADE
    );
  `);

  const familyRoomColumns = getAll(`PRAGMA table_info(family_rooms)`);
  const hasJoinCode = familyRoomColumns.some((column) => column.name === "joinCode");
  if (!hasJoinCode) {
    db.run(`ALTER TABLE family_rooms ADD COLUMN joinCode TEXT`);
  }
  saveDatabase();
};

export default initDatabase;
