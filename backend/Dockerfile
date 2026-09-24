# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies across workspaces
RUN npm ci

# Copy shared code & compile
COPY shared/ ./shared/
RUN npm run build --workspace=@skillsync/shared

# Copy backend source & Prisma schema
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/shared/dist /app/shared/dist
COPY --from=builder /app/backend/dist /app/backend/dist
COPY --from=builder /app/backend/prisma /app/backend/prisma
COPY --from=builder /app/backend/package.json /app/backend/package.json

EXPOSE 5000

CMD ["node", "dist/index.js"]
