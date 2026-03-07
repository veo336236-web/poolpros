import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

let _db: Database.Database | null = null;

export function getDb() {
  if (!_db) {
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      businessName TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      userId INTEGER NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS PartnerProduct (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT NOT NULL,
      price TEXT DEFAULT '',
      image TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Auction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      governorate TEXT NOT NULL,
      budget TEXT DEFAULT '',
      fileName TEXT DEFAULT '',
      status TEXT DEFAULT 'open',
      userId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Bid (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auctionId INTEGER NOT NULL,
      providerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT DEFAULT '',
      userId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auctionId) REFERENCES Auction(id),
      FOREIGN KEY (userId) REFERENCES User(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Review (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partnerId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partnerId) REFERENCES User(id),
      FOREIGN KEY (userId) REFERENCES User(id)
    );
  `);

  // Add userId column to existing Auction/Bid tables if missing
  try { db.exec("ALTER TABLE Auction ADD COLUMN userId INTEGER"); } catch { /* already exists */ }
  try { db.exec("ALTER TABLE Bid ADD COLUMN userId INTEGER"); } catch { /* already exists */ }
}
