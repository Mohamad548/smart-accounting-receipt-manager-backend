import { query, queryOne, execute } from '../database/query';
import { hashPassword, comparePassword } from '../utils/password';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
}

export class UserModel {
  static async create(username: string, password: string): Promise<User> {
    const id = globalThis.crypto.randomUUID();
    const createdAt = Date.now();
    const passwordHash = await hashPassword(password);

    await execute(
      `INSERT INTO users (id, username, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, username, passwordHash, createdAt, createdAt]
    );

    return {
      id,
      username,
      passwordHash,
      createdAt,
      updatedAt: createdAt,
    };
  }

  static async findByUsername(username: string): Promise<User | null> {
    const row = await queryOne<any>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: parseInt(row.created_at),
      updatedAt: parseInt(row.updated_at),
    };
  }

  static async findById(id: string): Promise<User | null> {
    const row = await queryOne<any>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: parseInt(row.created_at),
      updatedAt: parseInt(row.updated_at),
    };
  }

  static async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }
}
