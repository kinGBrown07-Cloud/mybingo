import { Pool, PoolConfig } from 'pg'
import { parse } from 'url'

// Parse the connection string
const connectionString = process.env.DATABASE_URL!
const { host, port, auth, pathname } = parse(connectionString)

// Configure connection pool
const poolConfig: PoolConfig = {
  user: auth?.split(':')[0],
  password: auth?.split(':')[1],
  host: host?.split('.')[0], // Get the first part of the hostname
  port: parseInt(port || '5432'),
  database: pathname?.split('/')[1],
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export const pool = new Pool(poolConfig)

// Add event listener for errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Helper function to execute queries
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}
