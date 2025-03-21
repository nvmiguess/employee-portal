import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let initialTime: number;

  beforeEach(() => {
    initialTime = 1647270000000; // March 14, 2022, 12:00:00 UTC
    jest.useFakeTimers();
    jest.setSystemTime(initialTime);
    
    // Create a fresh rate limiter before each test
    rateLimiter = new RateLimiter({
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 60 * 60 * 1000 // 1 hour
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isRateLimited', () => {
    it('should allow requests within limits', () => {
      const ip = '127.0.0.1';
      
      // Should allow up to maxAttempts
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isRateLimited(ip)).toBe(false);
      }
    });

    it('should block requests after exceeding limit', () => {
      const ip = '127.0.0.1';
      
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(ip);
      }
      
      // Should be blocked on the next attempt
      expect(rateLimiter.isRateLimited(ip)).toBe(true);
    });

    it('should track different IPs separately', () => {
      const ip1 = '127.0.0.1';
      const ip2 = '127.0.0.2';
      
      // Use up all attempts for ip1
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(ip1);
      }
      
      // ip1 should be blocked
      expect(rateLimiter.isRateLimited(ip1)).toBe(true);
      
      // ip2 should still be allowed
      expect(rateLimiter.isRateLimited(ip2)).toBe(false);
    });

    it('should reset after window period', () => {
      const ip = '127.0.0.1';
      
      // Use up some attempts but don't trigger block
      for (let i = 0; i < 4; i++) {
        rateLimiter.isRateLimited(ip);
      }
      
      // Advance time past window period
      jest.setSystemTime(initialTime + 15 * 60 * 1000 + 1000); // 15 minutes + 1 second
      
      // First request after window expiration should be allowed
      expect(rateLimiter.isRateLimited(ip)).toBe(false);
      
      // Should start counting from 1 again
      for (let i = 0; i < 4; i++) {
        expect(rateLimiter.isRateLimited(ip)).toBe(false);
      }
      
      // Should be blocked after exceeding limit again
      expect(rateLimiter.isRateLimited(ip)).toBe(true);
    });

    it('should maintain block duration after exceeding limit', () => {
      const ip = '127.0.0.1';
      
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(ip);
      }
      
      // Make one more request to trigger block
      expect(rateLimiter.isRateLimited(ip)).toBe(true);
      
      // Advance time but not past block duration
      jest.setSystemTime(initialTime + 30 * 60 * 1000); // 30 minutes
      
      // Should still be blocked
      expect(rateLimiter.isRateLimited(ip)).toBe(true);
      
      // Advance time past block duration
      jest.setSystemTime(initialTime + 60 * 60 * 1000 + 1000); // 1 hour + 1 second
      
      // Should be allowed again
      expect(rateLimiter.isRateLimited(ip)).toBe(false);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return correct remaining attempts', () => {
      const ip = '127.0.0.1';
      
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(5);
      
      rateLimiter.isRateLimited(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(4);
      
      rateLimiter.isRateLimited(ip);
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(3);
    });

    it('should return 0 when blocked', () => {
      const ip = '127.0.0.1';
      
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(ip);
      }
      
      // Make one more request to trigger block
      rateLimiter.isRateLimited(ip);
      
      expect(rateLimiter.getRemainingAttempts(ip)).toBe(0);
    });
  });

  describe('getBlockDuration', () => {
    it('should return remaining block time', () => {
      const ip = '127.0.0.1';
      
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(ip);
      }
      
      // Make one more request to trigger block
      rateLimiter.isRateLimited(ip);
      
      // Should be blocked for 1 hour
      expect(rateLimiter.getBlockDuration(ip)).toBe(60 * 60 * 1000);
      
      // Advance 30 minutes
      jest.setSystemTime(initialTime + 30 * 60 * 1000);
      
      // Should have 30 minutes remaining
      expect(rateLimiter.getBlockDuration(ip)).toBe(30 * 60 * 1000);
    });

    it('should return 0 when not blocked', () => {
      const ip = '127.0.0.1';
      expect(rateLimiter.getBlockDuration(ip)).toBe(0);
    });
  });
}); 