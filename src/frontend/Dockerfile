# Dev-focused Dockerfile for React frontend
FROM node:18-alpine AS base
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source (overridden by compose volume during development)
COPY . .

EXPOSE 3000

# Use the dev server so docker-compose port 3000 maps to host and supports HMR
CMD ["npm", "start"]
