import { PrismaClient } from '@prisma/client'
import { pool } from '../src/lib/neon'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface Profile {
  id: string
  email: string
  username: string
  coins: number
  points: number
  points_rate: number
  vip_level_id: string | null
  referrer_id: string | null
  region: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA'
  currency: 'XOF' | 'MAD' | 'EUR' | 'USD'
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  is_active: boolean
  created_at: Date
  updated_at: Date
}

interface GameSession {
  id: string
  type: 'CLASSIC' | 'MAGIC' | 'GOLD'
  profile_id: string
  points: number
  has_won: boolean
  matched_pairs: number
  created_at: Date
  updated_at: Date
}

interface CardFlip {
  id: string
  game_session_id: string
  card_index: number
  image_id: string
  is_matched: boolean
  is_winner: boolean
  prize_amount: number | null
  flipped_at: Date
}

interface Transaction {
  id: string
  profile_id: string
  amount: number
  points_amount: number
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  currency: 'XOF' | 'MAD' | 'EUR' | 'USD'
  game_session_id: string | null
  created_at: Date
  updated_at: Date
}

interface TransactionWithRegion extends Transaction {
  region: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA'
}

// Fonction pour convertir les points en devise selon la région
function getPointsRate(region: string): { rate: number; currency: string } {
  switch (region) {
    case 'BLACK_AFRICA':
      return { rate: 300, currency: 'XOF' } // 2 points = 300 XOF
    case 'NORTH_AFRICA':
      return { rate: 500, currency: 'MAD' } // 2 points = 500 MAD
    case 'EUROPE':
      return { rate: 2, currency: 'EUR' }   // 2 points = 2 EUR
    case 'AMERICAS':
    case 'ASIA':
      return { rate: 2, currency: 'USD' }   // 2 points = 2 USD
    default:
      return { rate: 300, currency: 'XOF' } // Default to BLACK_AFRICA rates
  }
}

async function migrateData() {
  try {
    // 1. Verify database connection
    const client = await pool.connect()
    console.log('Connected to Neon PostgreSQL')
    
    // 2. Read and execute migration SQL
    const sqlPath = path.join(process.cwd(), 'scripts', 'migrate-to-neon.sql')
    const migrationSql = await fs.readFile(sqlPath, 'utf-8')
    await client.query(migrationSql)
    console.log('Schema created successfully')

    // 3. Migrate profiles data
    const profiles = await prisma.$queryRaw<Profile[]>`
      SELECT * FROM profiles
    `
    for (const profile of profiles) {
      const { rate, currency } = getPointsRate(profile.region)
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
      ])
    }
    console.log('Profiles migrated successfully')

    // 4. Migrate game_sessions data
    const gameSessions = await prisma.$queryRaw<GameSession[]>`
      SELECT * FROM game_sessions
    `
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
      ])
    }
    console.log('Game sessions migrated successfully')

    // 5. Migrate card_flips data
    const cardFlips = await prisma.$queryRaw<CardFlip[]>`
      SELECT * FROM card_flips
    `
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
      ])
    }
    console.log('Card flips migrated successfully')

    // 6. Migrate transactions data with currency conversion
    const transactions = await prisma.$queryRaw<TransactionWithRegion[]>`
      SELECT t.*, p.region 
      FROM transactions t
      JOIN profiles p ON t.profile_id = p.id
    `
    for (const transaction of transactions) {
      const { currency } = getPointsRate(transaction.region)
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
      ])
    }
    console.log('Transactions migrated successfully')

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

migrateData()
  .catch(console.error)
  .finally(() => process.exit())
