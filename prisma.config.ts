import "dotenv/config";
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL || env('DIRECT_URL'), 
  },
});