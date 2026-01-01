import { Router, Response } from 'express';
import { UserModel } from '../models/UserModel.js';
import { RefreshTokenModel } from '../models/RefreshTokenModel.js';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt.js';

const router = Router();

// Cookie options
// Since we're using Authorization header for cross-origin, cookies are less critical
// But we still set them for same-origin requests
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || '';

// For Render (production), always use secure cookies with sameSite: 'none' for cross-origin support
// For local development, use lax with secure: false
const useSecureCookies = isProduction; // Render is always HTTPS
const useSameSiteNone = isProduction; // For cross-origin support on Render

const cookieOptions = {
  httpOnly: true,
  secure: useSecureCookies, // true for production (HTTPS)
  sameSite: (useSameSiteNone ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for access token (since we removed refresh token)
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: useSecureCookies, // true for production (HTTPS)
  sameSite: (useSameSiteNone ? 'none' : 'lax') as 'none' | 'lax',
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
      token: accessToken, // Also return token in response for cross-origin support
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطا در ورود به سیستم' });
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

