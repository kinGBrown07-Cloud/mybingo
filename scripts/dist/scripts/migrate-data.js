"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const neon_1 = require("../src/lib/neon");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function getPointsRate(region) {
    switch (region) {
        case 'BLACK_AFRICA':
            return { rate: 300, currency: 'XOF' };
        case 'NORTH_AFRICA':
            return { rate: 500, currency: 'MAD' };
        case 'EUROPE':
            return { rate: 2, currency: 'EUR' };
        case 'AMERICAS':
        case 'ASIA':
            return { rate: 2, currency: 'USD' };
        default:
            return { rate: 300, currency: 'XOF' };
    }
}
async function migrateData() {
    try {
        const client = await neon_1.pool.connect();
        console.log('Connected to Neon PostgreSQL');
        const sqlPath = path_1.default.join(process.cwd(), 'scripts', 'migrate-to-neon.sql');
        const migrationSql = await promises_1.default.readFile(sqlPath, 'utf-8');
        await client.query(migrationSql);
        console.log('Schema created successfully');
        const profiles = await prisma.$queryRaw `
      SELECT * FROM profiles
    `;
        for (const profile of profiles) {
            const { rate, currency } = getPointsRate(profile.region);
            await client.query(`
        INSERT INTO profiles (
          id, email, username, coins, points, points_rate,
          vip_level_id, referrer_id, region, currency,
          role, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE
        SET points_rate = EXCLUDED.points_rate,
            region = EXCLUDED.region,
            currency = EXCLUDED.currency,
            updated_at = CURRENT_TIMESTAMP
      `, [
                profile.id, profile.email, profile.username, profile.coins,
                profile.points, rate, profile.vip_level_id, profile.referrer_id,
                profile.region, currency, profile.role, profile.is_active,
                profile.created_at, profile.updated_at
            ]);
        }
        console.log('Profiles migrated successfully');
        const gameSessions = await prisma.$queryRaw `
      SELECT * FROM game_sessions
    `;
        for (const session of gameSessions) {
            await client.query(`
        INSERT INTO game_sessions (
          id, type, profile_id, points, has_won,
          matched_pairs, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
                session.id, session.type, session.profile_id, session.points,
                session.has_won, session.matched_pairs, session.created_at,
                session.updated_at
            ]);
        }
        console.log('Game sessions migrated successfully');
        const cardFlips = await prisma.$queryRaw `
      SELECT * FROM card_flips
    `;
        for (const flip of cardFlips) {
            await client.query(`
        INSERT INTO card_flips (
          id, game_session_id, card_index, image_id,
          is_matched, is_winner, prize_amount, flipped_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
                flip.id, flip.game_session_id, flip.card_index,
                flip.image_id, flip.is_matched, flip.is_winner,
                flip.prize_amount, flip.flipped_at
            ]);
        }
        console.log('Card flips migrated successfully');
        const transactions = await prisma.$queryRaw `
      SELECT t.*, p.region 
      FROM transactions t
      JOIN profiles p ON t.profile_id = p.id
    `;
        for (const transaction of transactions) {
            const { currency } = getPointsRate(transaction.region);
            await client.query(`
        INSERT INTO transactions (
          id, profile_id, amount, points_amount, type,
          status, currency, game_session_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
                transaction.id, transaction.profile_id, transaction.amount,
                transaction.points_amount, transaction.type, transaction.status,
                currency, transaction.game_session_id,
                transaction.created_at, transaction.updated_at
            ]);
        }
        console.log('Transactions migrated successfully');
        console.log('Migration completed successfully');
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
        await neon_1.pool.end();
    }
}
migrateData()
    .catch(console.error)
    .finally(() => process.exit());
//# sourceMappingURL=migrate-data.js.map