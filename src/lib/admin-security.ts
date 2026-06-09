// ─── Server-side Admin Security Module ────────────────────────────────────────
// Provides: rate limiting, IP-based restrictions, audit logging, session management,
// brute-force protection with exponential backoff, and encrypted session tokens.
//
// Cloudflare-compatible: Uses Web Crypto API instead of Node.js crypto.
// Works in both Node.js and Cloudflare Workers environments.

// ─── Configuration ─────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'geargeekz2026';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'gs-default-secret-change-in-production';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_BASE_DURATION = 60 * 1000; // 1 minute base, grows exponentially
const MAX_LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour max
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity = auto-logout

// Allowed IP ranges (empty = allow all). Configure via env as comma-separated CIDRs.
// e.g. ADMIN_ALLOWED_IPS="192.168.1.0/24,10.0.0.0/8"
const ALLOWED_IP_RANGES: string[] = (process.env.ADMIN_ALLOWED_IPS || '').split(',').filter(Boolean);

// ─── Web Crypto helpers ────────────────────────────────────────────────────────

function getTextEncoder(): TextEncoder {
  return new TextEncoder();
}

async function deriveKey(): Promise<CryptoKey> {
  // Derive a 256-bit AES-CBC key from the session secret using SHA-256
  const encoder = getTextEncoder();
  const keyMaterial = await crypto.subtle.digest('SHA-256', encoder.encode(SESSION_SECRET));
  return crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function encrypt(text: string): Promise<string> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoder = getTextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, encoder.encode(text));
  return arrayBufferToHex(iv.buffer as ArrayBuffer) + ':' + arrayBufferToHex(encrypted);
}

async function decrypt(encryptedText: string): Promise<string | null> {
  try {
    const key = await deriveKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;
    const iv = hexToUint8Array(parts[0]);
    const encrypted = hexToUint8Array(parts[1]);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv.buffer as ArrayBuffer },
      key,
      encrypted.buffer as ArrayBuffer,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

// ─── IP Validation ─────────────────────────────────────────────────────────────

function isIPInCIDR(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(range);
  return (ipInt & mask) === (rangeInt & mask);
}

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function isIPAllowed(ip: string): boolean {
  if (ALLOWED_IP_RANGES.length === 0) return true; // No restrictions configured
  return ALLOWED_IP_RANGES.some((cidr) => isIPInCIDR(ip, cidr));
}

// ─── In-memory rate limiting store ─────────────────────────────────────────────
// NOTE: On Cloudflare Workers, this state is per-isolate and not shared.
// For production, consider using Cloudflare KV or D1 for persistent rate limiting.

interface LoginAttemptRecord {
  attempts: number;
  lockedUntil: number;
  lastAttemptAt: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

// Audit log entries (in-memory, rotated)
interface AuditEntry {
  timestamp: number;
  ip: string;
  action: string;
  success: boolean;
  details?: string;
}

const auditLog: AuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 1000;

function addAuditEntry(ip: string, action: string, success: boolean, details?: string) {
  auditLog.push({ timestamp: Date.now(), ip, action, success, details });
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog.splice(0, auditLog.length - MAX_AUDIT_ENTRIES);
  }
}

// ─── Session token management ──────────────────────────────────────────────────

interface SessionData {
  authenticated: boolean;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  ip: string;
}

async function createSessionToken(ip: string): Promise<string> {
  const session: SessionData = {
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
    lastActivityAt: Date.now(),
    ip,
  };
  return encrypt(JSON.stringify(session));
}

async function validateSessionToken(token: string, ip: string): Promise<{ valid: boolean; reason?: string }> {
  const decrypted = await decrypt(token);
  if (!decrypted) return { valid: false, reason: 'Invalid token' };

  try {
    const session: SessionData = JSON.parse(decrypted);

    if (!session.authenticated) return { valid: false, reason: 'Not authenticated' };
    if (session.expiresAt < Date.now()) return { valid: false, reason: 'Session expired' };
    if (session.lastActivityAt + IDLE_TIMEOUT < Date.now()) {
      return { valid: false, reason: 'Session timed out due to inactivity' };
    }
    // Optionally enforce IP binding (comment out if behind proxy with varying IPs)
    // if (session.ip !== ip) return { valid: false, reason: 'IP mismatch' };

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Corrupt token' };
  }
}

async function refreshSessionToken(token: string): Promise<string | null> {
  const decrypted = await decrypt(token);
  if (!decrypted) return null;

  try {
    const session: SessionData = JSON.parse(decrypted);
    session.lastActivityAt = Date.now();
    return encrypt(JSON.stringify(session));
  } catch {
    return null;
  }
}

// ─── Login attempt tracking ────────────────────────────────────────────────────

function getAttemptRecord(ip: string): LoginAttemptRecord {
  let record = loginAttempts.get(ip);
  if (!record) {
    record = { attempts: 0, lockedUntil: 0, lastAttemptAt: 0 };
    loginAttempts.set(ip, record);
  }
  return record;
}

function checkLockout(ip: string): { locked: boolean; remainingMs: number } {
  const record = getAttemptRecord(ip);
  if (record.lockedUntil > Date.now()) {
    return { locked: true, remainingMs: record.lockedUntil - Date.now() };
  }
  return { locked: false, remainingMs: 0 };
}

function recordFailedAttempt(ip: string): { lockedOut: boolean; lockoutDurationMs: number } {
  const record = getAttemptRecord(ip);
  record.attempts += 1;
  record.lastAttemptAt = Date.now();

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    // Exponential backoff: 1min, 2min, 4min, 8min, 16min... up to 1 hour
    const exponent = Math.min(record.attempts - MAX_LOGIN_ATTEMPTS + 1, 6);
    const lockoutMs = Math.min(LOCKOUT_BASE_DURATION * Math.pow(2, exponent), MAX_LOCKOUT_DURATION);
    record.lockedUntil = Date.now() + lockoutMs;
    return { lockedOut: true, lockoutDurationMs: lockoutMs };
  }

  return { lockedOut: false, lockoutDurationMs: 0 };
}

function resetAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// ─── Password verification ─────────────────────────────────────────────────────

function verifyPassword(password: string): boolean {
  // Constant-time comparison to prevent timing attacks
  const expected = ADMIN_PASSWORD;
  if (password.length !== expected.length) {
    // Perform a dummy comparison to maintain constant time
    constantTimeCompare(password, password);
    return false;
  }
  return constantTimeCompare(password, expected);
}

/**
 * Constant-time string comparison.
 * Uses bitwise XOR to compare each character, accumulating differences.
 * Total time is proportional to the length of the shorter string.
 */
function constantTimeCompare(a: string, b: string): boolean {
  const aLen = a.length;
  const bLen = b.length;
  const len = Math.max(aLen, bLen);
  let result = aLen ^ bLen; // If lengths differ, result is non-zero

  for (let i = 0; i < len; i++) {
    const aChar = i < aLen ? a.charCodeAt(i) : 0;
    const bChar = i < bLen ? b.charCodeAt(i) : 0;
    result |= aChar ^ bChar;
  }

  return result === 0;
}

// ─── Exported API ──────────────────────────────────────────────────────────────

export const adminSecurity = {
  // Authentication
  async login(password: string, ip: string): Promise<{ success: boolean; token?: string; error?: string; lockoutRemainingMs?: number }> {
    addAuditEntry(ip, 'LOGIN_ATTEMPT', false);

    // Check IP allowlist
    if (!isIPAllowed(ip)) {
      addAuditEntry(ip, 'IP_BLOCKED', false, 'IP not in allowlist');
      return { success: false, error: 'Access denied from this IP address' };
    }

    // Check lockout
    const lockout = checkLockout(ip);
    if (lockout.locked) {
      addAuditEntry(ip, 'LOGIN_LOCKED_OUT', false, `Locked for ${Math.ceil(lockout.remainingMs / 1000)}s`);
      return { success: false, error: `Account locked. Try again in ${Math.ceil(lockout.remainingMs / 1000 / 60)} minutes.`, lockoutRemainingMs: lockout.remainingMs };
    }

    // Verify password
    const valid = verifyPassword(password);
    if (valid) {
      resetAttempts(ip);
      const token = await createSessionToken(ip);
      addAuditEntry(ip, 'LOGIN_SUCCESS', true);
      return { success: true, token };
    }

    // Failed
    const result = recordFailedAttempt(ip);
    addAuditEntry(ip, 'LOGIN_FAILED', false, `Attempt ${getAttemptRecord(ip).attempts}/${MAX_LOGIN_ATTEMPTS}`);

    if (result.lockedOut) {
      return {
        success: false,
        error: `Too many failed attempts. Account locked for ${Math.ceil(result.lockoutDurationMs / 1000 / 60)} minutes.`,
        lockoutRemainingMs: result.lockoutDurationMs,
      };
    }

    const remaining = MAX_LOGIN_ATTEMPTS - getAttemptRecord(ip).attempts;
    return { success: false, error: `Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
  },

  // Session validation
  async validateSession(token: string, ip: string): Promise<{ valid: boolean; reason?: string; refreshedToken?: string }> {
    const result = await validateSessionToken(token, ip);
    if (result.valid) {
      const refreshedToken = await refreshSessionToken(token);
      return { valid: true, refreshedToken: refreshedToken || undefined };
    }
    addAuditEntry(ip, 'SESSION_INVALID', false, result.reason);
    return result;
  },

  // Logout
  logout(token: string, ip: string) {
    addAuditEntry(ip, 'LOGOUT', true);
    // Token simply becomes invalid by not being renewed
  },

  // Change password
  changePassword(currentPassword: string, newPassword: string, ip: string): { success: boolean; error?: string } {
    if (!verifyPassword(currentPassword)) {
      addAuditEntry(ip, 'PASSWORD_CHANGE_FAILED', false, 'Current password incorrect');
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    // In production, this would update a database or env var
    addAuditEntry(ip, 'PASSWORD_CHANGE_ATTEMPT', true, 'Password change requires updating ADMIN_PASSWORD env var and restarting server');
    return { success: false, error: 'Password changes require updating the ADMIN_PASSWORD environment variable on the server. Contact your server administrator.' };
  },

  // Get audit log
  getAuditLog(limit = 50): AuditEntry[] {
    return auditLog.slice(-limit);
  },

  // Get login status for an IP
  getLoginStatus(ip: string): { attempts: number; locked: boolean; remainingMs: number } {
    const record = getAttemptRecord(ip);
    const lockout = checkLockout(ip);
    return {
      attempts: record.attempts,
      locked: lockout.locked,
      remainingMs: lockout.remainingMs,
    };
  },

  // Check if IP is allowed
  isIPAllowed(ip: string): boolean {
    return isIPAllowed(ip);
  },
};
