interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries every 60 seconds
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer(windowMs: number) {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove entries that haven't been accessed within twice the window
      if (now - entry.lastRefill > windowMs * 2) {
        store.delete(key);
      }
    }

    // Stop the timer if the store is empty
    if (store.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the process to exit even if the timer is still active
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check rate limit for a given key using a token-bucket algorithm.
 *
 * @param key      - Unique identifier (e.g. IP address, user ID)
 * @param limit    - Maximum number of requests allowed per window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  ensureCleanupTimer(windowMs);

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: limit, lastRefill: now };
    store.set(key, entry);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = limit / windowMs; // tokens per ms
  const tokensToAdd = elapsed * refillRate;
  entry.tokens = Math.min(limit, entry.tokens + tokensToAdd);
  entry.lastRefill = now;

  const resetAt = new Date(now + windowMs);

  if (entry.tokens < 1) {
    return {
      success: false,
      remaining: 0,
      resetAt,
    };
  }

  entry.tokens -= 1;

  return {
    success: true,
    remaining: Math.floor(entry.tokens),
    resetAt,
  };
}

/**
 * Create a reusable rate limiter with pre-configured limit and window.
 *
 * @param limit    - Maximum number of requests allowed per window
 * @param windowMs - Time window in milliseconds
 * @returns A function that accepts a key and returns the rate limit result
 */
export function createRateLimiter(
  limit: number,
  windowMs: number
): (key: string) => RateLimitResult {
  return (key: string) => rateLimit(key, limit, windowMs);
}
