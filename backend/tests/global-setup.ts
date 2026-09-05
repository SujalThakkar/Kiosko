/**
 * tests/global-setup.ts — runs once in a separate Node.js process before
 * Jest starts any test workers. Pushes the Prisma schema to a fresh test.db
 * so the test suite always starts from a clean schema.
 */
import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  const backendDir = path.resolve(__dirname, '..');
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit',
  });
}
