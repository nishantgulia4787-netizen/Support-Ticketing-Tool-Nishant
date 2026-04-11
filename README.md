# Support Ticketing Tool

A support ticketing system with:

- Spring Boot backend
- React + Vite frontend
- Local H2 database for development
- Ticket analytics dashboard

## Project structure

- `backend/` - Spring Boot API
- `frontend/` - React frontend
- `schema.sql` - Reference SQL schema

## Run locally

Open two terminals.

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Notes

- The backend uses an embedded H2 database by default for local development.
- The frontend proxies API requests to `http://localhost:8080`.
