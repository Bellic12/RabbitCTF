# RabbitCTF 🐇

**RabbitCTF** is a modern, scalable, and feature-rich **Capture The Flag (CTF)** platform designed for hosting cybersecurity competitions. It provides a seamless experience for both administrators and competitors, featuring real-time scoring, dynamic challenges, and team-based gameplay.

---

## Objectives

- **Education & Training**: Provide a robust environment for learning cybersecurity concepts through practical challenges.
- **Competition Management**: Simplify the organization of CTF events with automated scoring, timing, and user management.
- **Scalability**: Built to handle multiple teams and high traffic during intense competition windows.
- **User Experience**: Offer a responsive and intuitive interface for solving challenges and tracking progress.

---

## Technology Stack

### Backend (The Core)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python web framework).
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Robust relational database).
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (Database abstraction).
- **Validation**: [Pydantic](https://docs.pydantic.dev/) (Data validation and settings management).
- **Testing**: [Pytest](https://docs.pytest.org/) (Comprehensive test suite).
- **Security**: JWT Authentication, Bcrypt password hashing.

### Frontend (The Interface)
- **Framework**: [React](https://react.dev/) (v18+).
- **Build Tool**: [Vite](https://vitejs.dev/) (Lightning-fast development).
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Type safety).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/).
- **State Management**: React Context API & Custom Hooks.

### Infrastructure & DevOps
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose.
- **Web Server**: [Nginx](https://nginx.org/) (Reverse proxy and static file serving).

---

## Architecture

RabbitCTF follows a **Client-Server Architecture** containerized with Docker:

1.  **Frontend Container**: Serves the React SPA via Nginx. It communicates with the backend via REST API calls.
2.  **Backend Container**: Runs the FastAPI application via Uvicorn. It handles business logic, authentication, and scoring.
3.  **Database Container**: Hosts the PostgreSQL database, storing users, challenges, submissions, and configuration.

**Key Architectural Features:**
- **Stateless Authentication**: Uses JSON Web Tokens (JWT) for secure, scalable session management.
- **Dynamic Scoring**: Implemented in the backend logic to automatically adjust challenge points based on solve counts.
- **Event State Machine**: The system automatically transitions between `Not Started`, `Active`, and `Finished` states based on configuration, enforcing submission rules at the API level.

---

## Docker Usage

Docker is used to ensure consistency across development, testing, and production environments. The entire stack is defined in `docker-compose` files, orchestrating the services and their networks.

### Services
- `frontend`: The React application.
- **`backend`**: The FastAPI API.
- **`db`**: The PostgreSQL database.

---

## Getting Started

### Prerequisites
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)

### 1. Clone the Repository

```bash
git clone https://github.com/Bellic12/RabbitCTF.git
cd RabbitCTF
```

### 2. Run for Development
Use this mode for active development. It enables **Hot Reloading** for both frontend and backend, and mounts local volumes so changes are reflected immediately.

```bash
# Start the development environment
docker compose -f docker-compose.dev.yml up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

### 3. Run for Production
Use this mode for deployment. It builds optimized static assets for the frontend and runs the backend in production mode.

```bash
# Start the production environment
docker compose -f docker-compose.yml up --build -d
```

- **Application**: http://localhost (Served via Nginx on port 80)

---

## 📂 Project Structure

```
RabbitCTF/
├── backend/            # FastAPI Application
│   ├── app/            # Source code (API, Models, Services)
│   ├── db/             # Database init scripts
│   └── tests/          # Integration & Unit tests
├── frontend/           # React Application
│   ├── src/            # Source code (Components, Pages, Hooks)
│   └── public/         # Static assets
├── docs/               # Documentation resources
├── docker-compose.yml      # Production orchestration
└── docker-compose.dev.yml  # Development orchestration
```

---

## Running Tests

To ensure system stability, you can run the integration tests inside the Docker container:

```bash
docker exec -it rabbitctf_backend_dev pytest
```

---

