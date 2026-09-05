import 'dotenv/config';
import app from './app';
import prisma from './prisma';
import { seed } from './seed';

const PORT = Number(process.env.PORT) || 8000;

async function main() {
  // Seed the database on first run (idempotent — skips if data already exists)
  await seed(prisma);

  app.listen(PORT, () => {
    console.log(`🚀  SmartIssue backend running at http://localhost:${PORT}`);
    console.log(`📖  (No Swagger UI in Express — use the frontend or curl)`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
