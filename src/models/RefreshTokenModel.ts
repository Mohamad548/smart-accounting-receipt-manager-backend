import { getDatabase } from '../database/db';
import { getTokenExpiry } from '../utils/jwt';

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export class RefreshTokenModel {
  static create(userId: string, token: string): RefreshToken {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const expiresAt = getTokenExpiry('7d') * 1000; // Convert to milliseconds

    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, token, expiresAt, createdAt);

    return {
      id,
      userId,
      token,
      expiresAt,
      createdAt,
    };
  }

  static findByToken(token: string): RefreshToken | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(token) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    };
  }

  static deleteByToken(token: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
    return result.changes > 0;
  }

  static deleteByUserId(userId: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
    return result.changes > 0;
  }

  static deleteExpired(): number {
    const db = getDatabase();
    const now = Date.now();
    const result = db.prepare('DELETE FROM refresh_tokens WHERE expires_at < ?').run(now);
    return result.changes;
  }
}

