import { query, queryOne, execute } from '../database/query';
import { getTokenExpiry } from '../utils/jwt';

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export class RefreshTokenModel {
  static async create(userId: string, token: string): Promise<RefreshToken> {
    const id = globalThis.crypto.randomUUID();
    const createdAt = Date.now();
    const expiresAt = getTokenExpiry('7d') * 1000; // Convert to milliseconds

    await execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, token, expiresAt, createdAt]
    );

    return {
      id,
      userId,
      token,
      expiresAt,
      createdAt,
    };
  }

  static async findByToken(token: string): Promise<RefreshToken | null> {
    const row = await queryOne<any>('SELECT * FROM refresh_tokens WHERE token = $1', [token]);

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiresAt: parseInt(row.expires_at),
      createdAt: parseInt(row.created_at),
    };
  }

  static async deleteByToken(token: string): Promise<boolean> {
    const result = await execute('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    return result > 0;
  }

  static async deleteByUserId(userId: string): Promise<boolean> {
    const result = await execute('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return result > 0;
  }

  static async deleteExpired(): Promise<number> {
    const now = Date.now();
    const result = await execute('DELETE FROM refresh_tokens WHERE expires_at < $1', [now]);
    return result;
  }
}
