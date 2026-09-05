import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from './prisma';

// NOTE: dev-only secret. Move to an environment variable before any real deployment.
const SECRET_KEY = process.env.JWT_SECRET || 'smartissue-dev-secret-change-me';
const TOKEN_EXPIRE = '12h';

export type Role = 'student' | 'professor' | 'lab_assistant';

// Minimal user shape attached to every authenticated request.
export interface AuthUser {
  id: number;
  role: Role;
  name: string;
  somaiyaId: string;
  department: string | null;
  roomIds: number[]; // populated for lab_assistant; empty for other roles
}

// Augment the Express Request type so downstream route handlers get a typed user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

export function signToken(userId: number, role: Role): string {
  return jwt.sign({ sub: String(userId), role }, SECRET_KEY, { expiresIn: TOKEN_EXPIRE });
}

function _decodeToken(token: string): { sub: string; role: Role } {
  try {
    return jwt.verify(token, SECRET_KEY) as { sub: string; role: Role };
  } catch {
    throw { status: 401, message: 'Could not validate credentials' };
  }
}

// ---------------------------------------------------------------------------
// Auth middleware — verifies JWT and attaches user to req
// ---------------------------------------------------------------------------

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ detail: 'Missing or invalid Authorization header' });
    return;
  }

  let payload: { sub: string; role: Role };
  try {
    payload = _decodeToken(authHeader.slice(7));
  } catch {
    res.status(401).json({ detail: 'Could not validate credentials' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    include: { rooms: { select: { id: true } } },
  });
  if (!user) {
    res.status(401).json({ detail: 'User not found' });
    return;
  }

  req.user = {
    id: user.id,
    role: user.role as Role,
    name: user.name,
    somaiyaId: user.somaiyaId,
    department: user.department,
    roomIds: user.rooms.map((r) => r.id),
  };
  next();
}

// ---------------------------------------------------------------------------
// Role guard — use AFTER requireAuth
// Maps directly to Python's require_roles(*roles) dependency.
// ---------------------------------------------------------------------------

export function roleGuard(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !(roles as string[]).includes(req.user.role)) {
      res.status(403).json({
        detail: `This action requires one of these roles: ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
