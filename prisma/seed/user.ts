import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


async function main() {
  const username = "founderFigure";

  const existing = await prisma.user.findUnique({ where: { username } });

  const user = existing ?? await prisma.user.create({
    data: {
      username,
      displayName: "Founder Figure",
      bio: "Seeded user for dev."
    }
  });

  console.log("Seeded user id:", user.id);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
