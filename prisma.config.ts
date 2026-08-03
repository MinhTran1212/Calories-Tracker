import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'), // Strictly handles the URL configuration
  },
});