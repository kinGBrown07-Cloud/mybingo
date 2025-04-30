"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const supabase_1 = require("../src/lib/supabase");
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
        console.log('Connected to Supabase');
        const sqlPath = path_1.default.join(process.cwd(), 'scripts', 'migrate-to-supabase.sql');
        const migrationSql = await promises_1.default.readFile(sqlPath, 'utf-8');
        
        // Exécuter le script SQL via le pool de connexions
        await supabase_1.query(migrationSql);
        console.log('Schema created successfully');

        const profiles = await prisma.$queryRaw `
      SELECT * FROM profiles
    `;
        for (const profile of profiles) {
            const { rate, currency } = getPointsRate(profile.region);
            const { error } = await supabase_1.supabase
                .from('profiles')
                .upsert({
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                    coins: profile.coins,
                    points: profile.points,
                    points_rate: rate,
                    vip_level_id: profile.vip_level_id,
                    referrer_id: profile.referrer_id,
                    region: profile.region,
                    currency: currency,
                    role: profile.role,
                    is_active: profile.is_active,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at
                });
            if (error) throw error;
        }
        console.log('Profiles migrated successfully');

        const gameSessions = await prisma.$queryRaw `
      SELECT * FROM game_sessions
    `;
        for (const session of gameSessions) {
            const { error } = await supabase_1.supabase
                .from('game_sessions')
                .upsert({
                    id: session.id,
                    type: session.type,
                    profile_id: session.profile_id,
                    points: session.points,
                    has_won: session.has_won,
                    matched_pairs: session.matched_pairs,
                    created_at: session.created_at,
                    updated_at: session.updated_at
                });
            if (error) throw error;
        }
        console.log('Game sessions migrated successfully');

        const cardFlips = await prisma.$queryRaw `
      SELECT * FROM card_flips
    `;
        for (const flip of cardFlips) {
            const { error } = await supabase_1.supabase
                .from('card_flips')
                .upsert({
                    id: flip.id,
                    game_session_id: flip.game_session_id,
                    card_index: flip.card_index,
                    image_id: flip.image_id,
                    is_matched: flip.is_matched,
                    is_winner: flip.is_winner,
                    prize_amount: flip.prize_amount,
                    flipped_at: flip.flipped_at
                });
            if (error) throw error;
        }
        console.log('Card flips migrated successfully');

        const transactions = await prisma.$queryRaw `
      SELECT t.*, p.region 
      FROM transactions t
      JOIN profiles p ON t.profile_id = p.id
    `;
        for (const transaction of transactions) {
            const { currency } = getPointsRate(transaction.region);
            const { error } = await supabase_1.supabase
                .from('transactions')
                .upsert({
                    id: transaction.id,
                    profile_id: transaction.profile_id,
                    amount: transaction.amount,
                    points_amount: transaction.points_amount,
                    type: transaction.type,
                    status: transaction.status,
                    currency: currency,
                    game_session_id: transaction.game_session_id,
                    created_at: transaction.created_at,
                    updated_at: transaction.updated_at
                });
            if (error) throw error;
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
    }
}
migrateData()
    .catch(console.error)
    .finally(() => process.exit());
//# sourceMappingURL=migrate-data.js.map