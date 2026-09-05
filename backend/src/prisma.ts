import { PrismaClient } from '@prisma/client';

// Singleton — the same PrismaClient instance is reused across the entire app.
// For tests, DATABASE_URL is set in tests/setup-env.ts before this module loads.
const prisma = new PrismaClient();

export default prisma;
