# Stage 1: Build the React frontend and bundle the Express server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies required for the build (supports both lockfile and fresh installs)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the complete source code
COPY . .

# Build the Vite SPA and esbuild backend bundle (outputs to /app/dist)
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install only production dependencies (skip dev and optional tools like tsx)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --omit=optional --ignore-scripts; else npm install --omit=dev --omit=optional --ignore-scripts; fi

# Copy compiled artifacts and static assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/floraMedica.stpaul2coderdojo.github.io ./floraMedica.stpaul2coderdojo.github.io

# Container listens on port 3000
EXPOSE 3000

# Run the bundled standalone CommonJS server
CMD ["node", "dist/server.cjs"]
