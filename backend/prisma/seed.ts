import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@bassdrop.local";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("admin1234", 10),
    },
  });

  const genres = ["Pop", "Rock", "Hip-Hop", "Chill", "Electronic", "Workout"];
  for (const name of genres) {
    const genre = await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    // Chat is organized around genres — each genre gets one matching room.
    const existingRoom = await prisma.groupChat.findFirst({ where: { genreId: genre.id } });
    if (!existingRoom) {
      await prisma.groupChat.create({ data: { name: genre.name, genreId: genre.id } });
    }
  }

  console.log(`Seeded admin (${admin.email}), ${genres.length} genres, and their chat rooms.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
