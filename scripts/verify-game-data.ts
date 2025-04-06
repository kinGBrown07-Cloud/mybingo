import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyGameData() {
  try {
    // Vérifier les types de jeux
    const games = await prisma.game.findMany();
    console.log('Games in database:', games);

    // Vérifier les sessions de jeu
    const gameSessions = await prisma.gameSession.findMany({
      include: {
        game: true,
        profile: true
      }
    });
    console.log('Game sessions:', gameSessions);

    // Vérifier les contraintes d'énumération
    const gameTypes = await prisma.$queryRaw`
      SELECT DISTINCT type FROM games;
    `;
    console.log('Game types in use:', gameTypes);

  } catch (error) {
    console.error('Error verifying game data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyGameData().catch(console.error);
