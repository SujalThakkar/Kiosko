/**
 * tests/setup-env.ts — loaded by Jest's `setupFiles` option BEFORE any
 * module is imported, so PrismaClient picks up the test DATABASE_URL.
 */
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET   = 'test-secret-key';
process.env.KIOSK_API_KEY = 'smartissue-kiosk-dev-key';
