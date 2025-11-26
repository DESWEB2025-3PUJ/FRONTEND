# ---------- BUILD STAGE ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/dist/frontend-wikigroup ./dist
EXPOSE 4000

CMD ["node", "dist/server/server.mjs"]
