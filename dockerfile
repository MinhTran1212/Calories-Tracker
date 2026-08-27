# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY public ./public

# Dummy URLs to bypass Prisma config validation during build
ENV DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN npx prisma generate
RUN npm run build

# Ensure generated Prisma client files are merged directly into dist/generated
RUN mkdir -p dist/generated && cp -rf src/generated/* dist/generated/

# Also copy src into runner just in case relative paths resolve against root
RUN cp -rf src/generated /app/generated_backup

RUN npm prune --production

# ---- Production Stage ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated_backup ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/public ./public

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]