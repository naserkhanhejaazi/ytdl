import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  ADMIN_IDS: z.string().default(''),
  TEMP_DIR: z.string().default('./temp'),
  DATABASE_PATH: z.string().default('./data/bot.db'),
});

export const config = envSchema.parse(process.env);
export const adminIds = config.ADMIN_IDS.split(',').map(Number).filter(Boolean);
