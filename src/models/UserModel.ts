import { getDatabase } from '../database/db';
import { hashPassword, comparePassword } from '../utils/password';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
}

export class UserModel {
  static create(username: string, password: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = getDatabase();
        const id = crypto.randomUUID();
        const createdAt = Date.now();
        const passwordHash = await hashPassword(password);

        db.prepare(`
          INSERT INTO users (id, username, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, username, passwordHash, createdAt, createdAt);

        resolve({
          id,
          username,
          passwordHash,
          createdAt,
          updatedAt: createdAt,
        });
      } catch (error: any) {
        reject(error);
      }
    });
  }

  static findByUsername(username: string): User | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static findById(id: string): User | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = this.findByUsername(username);
    if (!user) return null;

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }
}

