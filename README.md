# Finance Tracker

Finance Tracker es una aplicación web de código abierto para organizar y visualizar finanzas personales desde un solo lugar.

Nació como un proyecto para mi uso personal, con la intención de ayudarme a llevar un mejor control de cuentas, ingresos, gastos y movimientos. También quiero compartirlo con amistades que busquen una herramienta sencilla para entender mejor sus finanzas.

Actualmente es un MVP en desarrollo. El objetivo a futuro es reforzar su seguridad, mejorar la experiencia de uso y desplegar una versión accesible en línea.

## Funcionalidades

- Panel general con resúmenes y visualizaciones financieras.
- Administración de cuentas personales.
- Registro y consulta de ingresos, gastos y transferencias.
- Gestión de contactos relacionados con los movimientos.
- Soporte para categorías, tipos de cuenta y múltiples monedas.
- API REST documentada con OpenAPI y Swagger UI.
- Interfaz adaptable construida con Angular Material.

## Tecnologías

### Backend

- Java 21
- Spring Boot 4
- Spring Data JPA
- PostgreSQL
- Springdoc OpenAPI
- Maven

### Frontend

- Angular 22
- Angular Material
- TypeScript
- Chart.js
- Vitest

### Infraestructura

- Docker Compose
- Nginx

## Estructura

```text
finance-tracker-lich/
├── backend/          # API REST con Spring Boot
├── frontend/         # Aplicación web con Angular
├── nginx/            # Proxy inverso para desarrollo
├── docker-compose.yml
└── README.DEV.md     # Instrucciones adicionales de desarrollo
```

## Ejecutar localmente

La forma más sencilla de iniciar el proyecto completo es mediante Docker Compose.

### Requisitos

- Docker
- Docker Compose

### Inicio

```bash
git clone https://github.com/paulo-rojas/finance-tracker-lich.git
cd finance-tracker-lich
docker compose up
```

Una vez iniciados los servicios:

- Aplicación: <http://localhost>
- Frontend: <http://localhost:4200>
- Backend: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI: <http://localhost:8080/v3/api-docs>

Para detener el entorno:

```bash
docker compose down
```

Consulta [README.DEV.md](README.DEV.md) para encontrar instrucciones de ejecución y pruebas sin Docker.

## Estado del proyecto

Finance Tracker se encuentra en una etapa temprana de desarrollo. Aunque las funciones principales del MVP ya están implementadas, todavía no debe considerarse listo para producción ni utilizarse para almacenar información financiera sensible.

Las siguientes prioridades son:

- Validación de datos en frontend y backend.
- Autenticación y autorización con Spring Security.
- Almacenamiento seguro de contraseñas.
- Aislamiento de la información de cada usuario.
- Configuración segura mediante variables de entorno.
- Mayor cobertura de pruebas.
- Imágenes de producción y despliegue público.

## Contribuciones

El proyecto está abierto para aprender, experimentar y seguir mejorándolo. Las sugerencias, reportes de errores y contribuciones son bienvenidos mediante issues o pull requests.

## Licencia

Este proyecto se distribuye bajo la [Apache License 2.0](LICENSE).

## Autor

Desarrollado por [Paulo Rojas](https://github.com/paulo-rojas), con apoyo de herramientas de inteligencia artificial utilizadas como parte del proceso de diseño e implementación.
