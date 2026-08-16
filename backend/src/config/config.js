import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current directory or root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to process cwd .env

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_crm_secret_key_999911';
export const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../database/crm.db');
export const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
export const NODE_ENV = process.env.NODE_ENV || 'development';
