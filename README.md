# Elishop - Monorepo 💎

Sistema completo de e-commerce para Elishop: Landing Page, Catálogo, Sistema de Inventario y Tienda Online.

## 📁 Estructura del Proyecto

```
Elishop/
├── frontend/          # React + Vite (Landing Page y Catálogo)
├── backend/           # NestJS (API REST - Inventario)
├── docker-compose.yml # PostgreSQL + pgAdmin
└── README.md
```

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite |
| Backend | NestJS + TypeScript |
| Base de Datos | PostgreSQL 16 |
| ORM | Prisma |
| Autenticación | JWT + Passport |
| Contenedores | Docker |

## 🚀 Inicio Rápido

### 1. Levantar la Base de Datos

```bash
docker-compose up -d
```

### 2. Iniciar el Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Iniciar el Backend

```bash
cd backend
npm install
npm run start:dev
```

## 🐳 Docker - PostgreSQL

### Credenciales

```
Host:     localhost
Puerto:   5432
Usuario:  elishop_admin
Password: Elishop2026!Secure
Database: elishop_db

DATABASE_URL=postgresql://elishop_admin:Elishop2026!Secure@localhost:5432/elishop_db
```

### pgAdmin (Administrador visual)

- URL: http://localhost:5050
- Email: admin@elishop.ec
- Password: Admin2026!

### Comandos Docker

```bash
# Ver estado de contenedores
docker ps

# Ver logs de PostgreSQL
docker logs elishop_postgres

# Entrar a psql
docker exec -it elishop_postgres psql -U elishop_admin -d elishop_db

# Detener servicios
docker-compose down

# Detener y borrar datos (⚠️ cuidado)
docker-compose down -v
```

## 📝 Licencia

Proyecto privado - Elishop Ecuador
