# -------- Build Stage --------
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install all dependencies (dev + prod) for build
RUN npm install

# Copy project source including swagger.yaml
COPY . .

# Compile TypeScript
RUN npm run build

# -------- Runtime Stage --------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy only necessary files from build
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/keys ./keys
COPY --from=build /usr/src/app/src/config/swagger.yaml ./src/config/swagger.yaml

# Set environment to production
ENV NODE_ENV=production

# Start the app
CMD ["node", "dist/server.js"]
