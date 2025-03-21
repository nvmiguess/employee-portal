export interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimiterRecord {
  attempts: number;
  windowStart: number;
  blockedUntil: number | null;
}

export class RateLimiter {
  private records: Map<string, RateLimiterRecord>;
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.records = new Map();
    this.config = config;
  }

  private getRecord(ip: string): RateLimiterRecord {
    const now = Date.now();
    let record = this.records.get(ip);

    if (!record) {
      record = {
        attempts: 0,
        windowStart: now,
        blockedUntil: null
      };
      this.records.set(ip, record);
    }

    return record;
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = this.getRecord(ip);

    // First check if currently blocked
    if (record.blockedUntil !== null) {
      if (now >= record.blockedUntil) {
        // Block duration has passed, reset the record
        record.attempts = 1;
        record.windowStart = now;
        record.blockedUntil = null;
        this.records.set(ip, record);
        return false;
      }
      return true;
    }

    // Then check if window has expired (only if not blocked)
    if (now >= record.windowStart + this.config.windowMs) {
      record.attempts = 1;
      record.windowStart = now;
      this.records.set(ip, record);
      return false;
    }

    // Increment attempts and check if exceeded
    record.attempts++;
    if (record.attempts > this.config.maxAttempts) {
      record.blockedUntil = now + this.config.blockDurationMs;
      this.records.set(ip, record);
      return true;
    }

    this.records.set(ip, record);
    return false;
  }

  getRemainingAttempts(ip: string): number {
    const record = this.getRecord(ip);
    const now = Date.now();

    // Check if blocked first
    if (record.blockedUntil !== null && now < record.blockedUntil) {
      return 0;
    }

    // Then check window expiration
    if (now >= record.windowStart + this.config.windowMs) {
      return this.config.maxAttempts;
    }

    return Math.max(0, this.config.maxAttempts - record.attempts);
  }

  getBlockDuration(ip: string): number {
    const record = this.getRecord(ip);
    const now = Date.now();

    if (record.blockedUntil === null || now >= record.blockedUntil) {
      return 0;
    }

    return record.blockedUntil - now;
  }
} 