# Stage 1: Prepare dependencies stage
FROM node:lts-alpine as dependencies
WORKDIR /app
COPY package.json ./
RUN yarn install --frozen-lockfile --production

# Stage 2: Build stage
FROM dependencies as builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

# Stage 3: Final runtime stage
FROM node:lts-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./
COPY --from=builder /app/dist ./dist
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
EXPOSE 4000
CMD ["yarn", "run", "start:prod"]

