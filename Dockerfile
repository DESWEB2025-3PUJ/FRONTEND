# ---------- BUILD STAGE ----------
FROM node:18-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copiar el código fuente
COPY . .

# Construir la aplicación Angular con SSR
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:18-alpine
WORKDIR /app

# Instalar solo las dependencias de producción necesarias para Express
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar los archivos compilados desde el stage de build
COPY --from=build /app/dist/frontend-wikigroup ./dist/frontend-wikigroup

# Exponer el puerto 4000
EXPOSE 4000

# Variables de entorno (pueden ser sobrescritas por docker-compose)
ENV NODE_ENV=production
ENV PORT=4000

# Ejecutar el servidor SSR
CMD ["node", "dist/frontend-wikigroup/server/server.mjs"]
