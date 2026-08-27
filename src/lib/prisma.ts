import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
require('dotenv').config(); // MUST be at the top!


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// Add this in your lib/prisma.ts
console.log("-----------------------------------------");
console.log("Prisma is connecting to DATABASE_URL:");
console.log(process.env.DATABASE_URL);
console.log("-----------------------------------------");

export default prisma;