# API Layer (Presentation Layer)

The API layer serves as the entry point for all external requests to the RabbitCTF backend. It is responsible for handling HTTP requests, validating inputs, and returning appropriate HTTP responses. This layer acts as the bridge between the Frontend (React) and the core business logic (Services).

## Key Responsibilities
- **Routing**: Mapping HTTP URLs and methods (GET, POST, PUT, DELETE) to specific python functions.
- **Input Validation**: Using Pydantic schemas to ensure incoming data meets the required format and constraints before processing.
- **Authentication & Authorization**: Verifying user identity (JWT) and permissions (Admin vs Participant) via dependency injection.
- **Response Formatting**: Structuring the data returned to the client, ensuring sensitive information is filtered out.

## Structure & Business Logic

- **`v1/`**: Version 1 of the API.
  - **`router.py`**: The central hub that aggregates all module routers.
  - **`auth.py`**: **Critical**. Handles the JWT token issuance. Without this, no user can access protected resources.
  - **`admin.py`**: **Restricted**. Endpoints for game masters to control the event state (Start/Stop), manage users, and configure rules.
  - **`challenges.py`**: Delivers challenge data to competitors. It respects visibility rules (e.g., hidden challenges are not returned).
  - **`submissions.py`**: **High Traffic**. The most critical endpoint during the event. It receives flags, validates them via the `SubmissionService`, and returns immediate feedback.
  - **`teams.py`**: Manages team lifecycle. Enforces rules like "max team size" or "invite-only" joining.
  - **`leaderboard.py`**: Provides real-time ranking data. Optimized for read performance.
  - **`event.py`**: Exposes the current event status (Not Started, Active, Finished) which drives the frontend UI state.

- **`deps.py`**: **Security Core**. Contains reusable dependencies:
  - `get_current_user`: Decodes the JWT header, verifies the signature, and retrieves the user context.
  - `get_current_admin`: Adds an extra layer of checking to ensure the requester has the `ADMIN` role.
