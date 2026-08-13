FROM node:24-alpine AS dev
WORKDIR /app
COPY package.json ./
RUN npm install
CMD [ "npm","run","start:dev" ]

FROM node:24-alpine AS dev-deps
WORKDIR /app
COPY package.json package.json
RUN npm install --no-optional --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package.json
RUN npm install --production --no-optional --frozen-lockfile

FROM node:24-alpine AS prod
EXPOSE 3000
WORKDIR /app
ENV APP_VERSION=${APP_VERSION}
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node","dist/main.js"]
