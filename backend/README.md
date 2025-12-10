# RabbitCTF Backend

This is the core engine of the RabbitCTF platform. Built with **FastAPI**, it provides a high-performance, asynchronous REST API that powers the Capture The Flag competition.

## Architecture Overview

The backend follows a **Layered Architecture** to ensure separation of concerns, maintainability, and scalability.

### Data Flow
1.  **Request**: The Frontend (React) sends an HTTP request (e.g., `POST /submit`).
2.  **API Layer (`app/api`)**:
    - Receives the request.
    - **Validation**: Uses **Pydantic Schemas (`app/schemas`)** to validate the payload (e.g., "Is the flag string empty?").
    - **Auth**: Checks the JWT token via **Dependencies (`app/api/deps.py`)** to identify the user.
3.  **Service Layer (`app/services`)**:
    - The API controller calls a specific service (e.g., `SubmissionService`).
    - **Business Logic**: The service checks rules: "Is the event active?", "Is this the correct flag?", "Calculate points".
4.  **Data Layer (`app/models`)**:
    - The service interacts with **SQLAlchemy Models** to read/write to the database.
5.  **Database**: PostgreSQL stores the persistent state.

## Communication with Frontend

- **Protocol**: RESTful API over HTTP/HTTPS.
- **Data Format**: JSON.
- **Authentication**: Stateless **JWT (JSON Web Tokens)**.
    - The frontend sends the token in the `Authorization: Bearer <token>` header for every protected request.
- **Real-time Updates**: The frontend polls specific endpoints (like `/event/status`) to stay in sync with the server state (e.g., Event Timer).
- **CORS**: Configured in `app/core/config.py` to allow requests from the frontend domain.

## Key Features & Business Logic

- **Dynamic Scoring**: Implemented in `app/core/scoring.py`. Points for a challenge decay automatically as more teams solve it.
- **Event Lifecycle**: Controlled by `EventConfig`. The system automatically transitions between `NOT_STARTED`, `ACTIVE`, and `FINISHED` based on time, blocking or allowing submissions accordingly.
- **Team-Based Competition**: Users must belong to a team. Scores are aggregated at the team level.
- **Security**:
    - Passwords are hashed with **bcrypt**.
    - Role-Based Access Control (RBAC) distinguishes between `ADMIN` and `PARTICIPANT`.

## Project Structure

- **`app/`**: Main application source code.
  - **`api/`**: **Controllers**. Route definitions and request handling.
  - **`core/`**: **Infrastructure**. Config, DB connection, Security, Enums.
  - **`models/`**: **Database**. SQLAlchemy ORM classes.
  - **`schemas/`**: **Validation**. Pydantic DTOs.
  - **`services/`**: **Logic**. The "brain" of the application.
- **`db/`**: **Initialization**. SQL scripts for bootstrapping the DB.
- **`tests/`**: **QA**. Integration and Unit tests.

## Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL
- Docker (optional, for containerized deployment)

### Running Locally

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Access Documentation**:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Key Features
- **Dynamic Scoring**: Challenge points decay as more teams solve them.
- **Event Management**: Automated start/stop times and manual overrides.
- **Team System**: Team-based participation and scoring.
- **Real-time Updates**: Polling-based status synchronization.
