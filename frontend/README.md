# Frontend - ClinikApp

Interfaz de usuario construida con Angular.

## Requisitos

- [Node.js](https://nodejs.org/) 18+

## Instalación y ejecución local

1. **Entra al directorio frontend:**
   ```bash
   cd frontend
   ```
2. **Instala las dependencias:**
   ```bash
   npm install
   ```
3. **Configura la URL de la API:**
   Edita el archivo `src/environments/environment.ts` y coloca la URL de tu backend en `API_URL`:
   ```ts
   export const environment = {
     production: true,
     API_URL: "http://localhost:8000",
   };
   ```
4. **Ejecuta el frontend:**
   ```bash
   npm start
   ```

La aplicación estará disponible en [http://localhost:4200](http://localhost:4200)

## Notas

- Puedes personalizar la configuración en los archivos de enviroment.
- Para otros comandos y scripts, revisa el archivo `package.json`.
