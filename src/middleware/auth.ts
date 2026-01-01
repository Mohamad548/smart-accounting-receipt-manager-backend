import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'دسترسی غیرمجاز. لطفاً وارد شوید.' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'توکن نامعتبر یا منقضی شده است.' });
  }

  req.user = payload;
  next();
}

