# Backend - ClinikApp

API RESTful construida con FastAPI para la gestión clínica.

## Requisitos

- Python 3.11+
- [pip](https://pip.pypa.io/en/stable/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/) (para levantar la app y la base de datos fácilmente)

## Requisitos de Docker Compose

Para levantar el entorno completo con un solo comando necesitas tener instalado:

- **Docker**: Motor de contenedores.
- **Docker Compose**: Orquestador de servicios multi-contenedor.

El archivo `docker-compose.yml` levanta dos servicios:

- **db**: Base de datos PostgreSQL (puerto 5432)
- **app**: Backend FastAPI (puerto 8000)

## Instalación y ejecución local

1. **Clona el repositorio y entra al directorio backend:**

   ```bash
   cd backend
   ```

2. **Configura las variables de entorno:**
   Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medical_db
   SECRET_KEY=tu_clave_secreta
   ALGORITHM=HS256
   FRONTEND_URL=http://localhost:4200
   ```

   - `FRONTEND_URL`: URL permitida para CORS (la del frontend, por defecto http://localhost:4200)

3. **Crea la app y la base de datos:**

```bash
docker-compose up --build
```

La API estará disponible en [http://localhost:8000](http://localhost:8000)

## Notas

- El backend incluye CORS habilitado para facilitar el desarrollo local.
- Para desarrollo y pruebas, revisa `requirements.dev.txt`.
- Puedes levantar todo (backend y base de datos) con:
  ```bash
  docker-compose up --build
  ```
