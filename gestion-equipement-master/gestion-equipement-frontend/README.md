# Gestion Equipement - Frontend

Angular frontend for the equipment, supplier, purchase, and rental management
application. The application reads and writes data through the Spring Boot API;
the JSON files under `src/assets/data/` are no longer used as application data.

## Run locally

1. Configure the backend database and JWT settings in the root `.env` file.
2. Start the Spring Boot backend on `http://localhost:8080`.
3. From this directory, run:

   ```bash
   npm install
   npm start
   ```

The Angular development server proxies `/api` requests to the backend on port
8080. Sign in with an employee account already stored in the backend database.

## API integration

The frontend uses these endpoints:

| Feature | Endpoints |
| --- | --- |
| Authentication | `POST /api/auth/login` |
| Categories | `/api/categories` |
| Machines | `/api/machines` and machine state/assignment actions |
| Articles | `/api/articles-quincaillerie` |
| Suppliers | `/api/fournisseurs` |
| Employees | `/api/employes` |
| Supplier rentals | `/api/locations-fournisseurs` |
| Purchases | `/api/achats` |

The login token is stored for the browser session and automatically attached to
API requests. In production, route `/api` to the Spring Boot backend on the
same origin (or configure an equivalent reverse proxy). The backend JWT lifetime
is configured by `JWT_EXPIRATION_MS` in the root `.env` file (1 hour by default).

On backend startup, an idempotent schema migration makes the daily machine
rental price nullable for existing PostgreSQL databases.

API errors use a consistent JSON response. The frontend translates common
connection, validation, authentication, permission, missing-resource, and
conflict errors into clear French messages, shown on the affected page or form.
