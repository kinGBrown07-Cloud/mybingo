import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'cd8656dd-7246-420a-b3e9-bbec884de3e5';

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' }
  });

  console.log('User promoted to admin:', updatedUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
