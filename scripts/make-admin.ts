/**
 * Usage: npx tsx scripts/make-admin.ts someone@example.com
 *
 * There's no in-app way to become an admin — no signup flow should ever
 * let a user grant themselves elevated access. This script (or editing
 * the User row directly in `npx prisma studio`) is the intended way to
 * create the first admin account.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts someone@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}. Register the account first, then run this.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${email} is now an admin.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
