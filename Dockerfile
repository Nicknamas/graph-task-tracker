FROM node:lts-alpine3.22 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .

RUN NODE_OPTIONS="--max-old-space-size=1024" npm run build

FROM node:lts-alpine3.22 AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "0.0.0.0:3000"]