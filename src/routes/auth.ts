import { Router, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { RefreshTokenModel } from '../models/RefreshTokenModel';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt';

const router = Router();

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes for access token
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};

// POST /api/auth/login - Login
router.post('/login', async (req, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });
    }

    const user = await UserModel.verifyPassword(username, password);
    if (!user) {
      return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to database
    await RefreshTokenModel.create(user.id, refreshToken);

    // Set cookies
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطا در ورود به سیستم' });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token یافت نشد' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(403).json({ message: 'Refresh token نامعتبر است' });
    }

    // Check if token exists in database
    const tokenRecord = await RefreshTokenModel.findByToken(refreshToken);
    if (!tokenRecord) {
      return res.status(403).json({ message: 'Refresh token یافت نشد' });
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < Date.now()) {
      await RefreshTokenModel.deleteByToken(refreshToken);
      return res.status(403).json({ message: 'Refresh token منقضی شده است' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      username: payload.username,
    });

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, cookieOptions);

    res.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'خطا در تازه‌سازی توکن' });
  }
});

// POST /api/auth/logout - Logout
router.post('/logout', async (req, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Delete refresh token from database
    if (refreshToken) {
      await RefreshTokenModel.deleteByToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', refreshCookieOptions);

    res.json({ success: true, message: 'با موفقیت خارج شدید' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'خطا در خروج از سیستم' });
  }
});

// Removed /me endpoint - authentication is handled via cookies and token refresh
// User info is returned in login response and stored in frontend

export default router;

