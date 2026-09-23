import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'splash-admin';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const sessions = new Map<string, number>(); // token -> expiresAt

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // still run a comparison of equal length to avoid an early-exit timing signal
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(password: string): boolean {
  return timingSafeEqual(password, ADMIN_PASSWORD);
}

export function issueToken(): string {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function isValid(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!isValid(token)) {
    res.status(401).json({ error: 'Nicht angemeldet.' });
    return;
  }
  next();
}
