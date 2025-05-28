# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 9002
ENV NODE_ENV production
CMD ["npm", "start"]
