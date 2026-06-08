# Desarrollo — Instrucciones

Este repositorio está preparado para desarrollo local usando Docker Compose.

Arrancar el entorno de desarrollo (build no requerido para este modo):

```bash
docker compose up
```

Detener y limpiar:

```bash
docker compose down
```

Backend (Java / Spring Boot)
- Código: `backend/`
- Ejecutar localmente dentro del contenedor:

```bash
# desde la raíz
docker compose up

# o en desarrollo sin Docker
cd backend
./mvnw spring-boot:run
```

Para ejecutar tests:

```bash
cd backend
./mvnw test
```

Frontend (Angular)
- Código: `frontend/`
- En desarrollo usa el contenedor con hot-reload:

```bash
docker compose up

# o localmente
cd frontend
npm install
npm start -- --host 0.0.0.0 --port 4200
```

Base de datos
- Postgres expuesto en `localhost:5432` (usuario/clave: `finance_tracker`).

Notas
- El `docker-compose.yml` monta los directorios fuente como volúmenes para desarrollo.
- Para producción, se recomienda crear Dockerfiles multi-stage y servir la app con una imagen runtime ligera. Si quieres, lo preparo cuando pases a producción.
- En Windows es recomendable usar WSL2 o Git Bash para compatibilidad con scripts shell.
