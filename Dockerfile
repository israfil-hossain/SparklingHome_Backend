# Stage 1: Build stage
FROM node:lts-alpine as builder
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 2: Production dependencies stage
FROM node:lts-alpine as dependencies
WORKDIR /app
COPY package.json ./
RUN yarn install --production

# Stage 3: Final runtime stage
FROM node:lts-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
EXPOSE 4000
CMD ["yarn", "run", "start:prod"]
