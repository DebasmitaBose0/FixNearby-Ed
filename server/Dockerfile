FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS development

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS production

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
