import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // Try to get token from cookies first
  let token = req.cookies?.accessToken;
  
  // If no cookie, try Authorization header (for cross-origin support)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    console.log('No token found. Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    return res.status(401).json({ message: 'دسترسی غیرمجاز. لطفاً وارد شوید.' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    console.log('Token verification failed');
    return res.status(403).json({ message: 'توکن نامعتبر یا منقضی شده است.' });
  }

  req.user = payload;
  next();
}

