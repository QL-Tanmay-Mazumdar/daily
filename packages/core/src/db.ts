import dotenv from 'dotenv'
import knex from 'knex'

dotenv.config()
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to connect to PostgreSQL')
}

export const db = knex({
  client: 'pg',
  connection: databaseUrl,
  pool: {
    min: 0,
    max: Number(process.env.DATABASE_POOL_MAX || 10),
  },
})

export const checkDatabaseConnection = async () => {
  const result = await db.raw('SELECT VERSION();')

  return result?.rows?.[0]?.version
}
