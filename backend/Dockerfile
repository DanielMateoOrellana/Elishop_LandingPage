# Base image
FROM node:20-alpine

# Instalar dependencias necesarias para Prisma (OpenSSL)
RUN apk add --no-cache openssl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente y prisma
COPY prisma ./prisma/
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar la aplicación
RUN npm run build

# Copiar entrypoint
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Exponer el puerto
EXPOSE 3000

# Usar el script como comando de inicio
CMD ["./docker-entrypoint.sh"]
