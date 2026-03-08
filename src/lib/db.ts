import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _initialized = false;

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    _client = url
      ? createClient({ url, authToken })
      : createClient({ url: "file:local.db" });
  }
  return _client;
}

export async function ensureDb(): Promise<Client> {
  const client = getClient();
  if (!_initialized) {
    await client.executeMultiple(`
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

      CREATE TABLE IF NOT EXISTS BusinessRegistration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        businessName TEXT NOT NULL,
        ownerName TEXT NOT NULL,
        phone TEXT NOT NULL,
        category TEXT NOT NULL,
        governorate TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS Booking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        customerName TEXT NOT NULL,
        customerPhone TEXT NOT NULL,
        providerId TEXT NOT NULL,
        providerName TEXT NOT NULL,
        serviceId TEXT NOT NULL,
        serviceName TEXT NOT NULL,
        preferredDate TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        rejectionReason TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES User(id)
      );

      CREATE TABLE IF NOT EXISTS Otp (
        phone TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expiresAt DATETIME NOT NULL
      );
    `);
    _initialized = true;
  }
  return client;
}
