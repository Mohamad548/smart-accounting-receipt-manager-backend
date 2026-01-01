import { RefreshTokenModel } from '../models/RefreshTokenModel';

// Cleanup expired refresh tokens periodically
export function startTokenCleanup() {
  // Run cleanup every hour
  setInterval(() => {
    try {
      const deleted = RefreshTokenModel.deleteExpired();
      if (deleted > 0) {
        console.log(`🧹 Cleaned up ${deleted} expired refresh tokens`);
      }
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  // Run initial cleanup
  try {
    const deleted = RefreshTokenModel.deleteExpired();
    if (deleted > 0) {
      console.log(`🧹 Initial cleanup: removed ${deleted} expired refresh tokens`);
    }
  } catch (error) {
    console.error('Error in initial token cleanup:', error);
  }
}

