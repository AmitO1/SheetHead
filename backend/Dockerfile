# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
