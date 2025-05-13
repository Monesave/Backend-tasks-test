import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

export function getDbClient() {
  return new Client({
    connectionString: process.env.SUPABASE_URI,
    ssl: { rejectUnauthorized: false },
  });
}