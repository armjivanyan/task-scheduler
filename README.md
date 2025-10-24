# Task Scheduler (NestJS + Vue 3 + Naive UI)

Internal task scheduling with **strict no-overlap** per user with async availability recompute.

## Quickstart (Dev via Docker)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev:all    # or: docker compose up --build
# first-time DB init:
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3000/api
- Adminer:  http://localhost:8080 (System: MySQL, Server: db, User: root, Pass: password, DB: task_scheduler)

**Login:** admin@example.com / Admin123!
