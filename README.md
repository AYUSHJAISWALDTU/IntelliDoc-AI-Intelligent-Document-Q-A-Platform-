# IntelliDoc AI

IntelliDoc AI is a full-stack intelligent document Q&A platform. This repo provides a minimal runnable foundation: FastAPI backend, React frontend, and Docker Compose for local development.

## Local Development (Docker)

1. Copy `.env.example` to `.env` and fill values.
2. Start services with Docker Compose.

The backend exposes `http://localhost:8000` and the frontend runs on `http://localhost:3000`.

## Project Layout

- `backend/`: FastAPI API, services, workers
- `frontend/`: React + Vite client
- `infrastructure/`: Terraform skeleton
- `docs/`: architecture and API docs

## Notes

This is a scaffold intended to be iterated into the full IntelliDoc AI feature set described in the requirements. Replace placeholder values and extend modules as needed.
