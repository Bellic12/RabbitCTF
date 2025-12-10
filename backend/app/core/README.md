# Core Module (Infrastructure & Utilities)

This directory acts as the "nervous system" of the application. It contains the fundamental building blocks, configuration, and shared utilities that are used across all other layers (API, Services, Models).

## Key Components & Business Logic

- **`config.py`**: **Configuration Hub**.
  - Manages environment variables (Database URL, Secret Keys, CORS origins).
  - Follows the **12-Factor App** methodology.
  - Ensures the app behaves correctly in different environments (Dev, Test, Prod) without code changes.

- **`database.py`**: **Data Persistence Layer**.
  - Sets up the SQLAlchemy `Engine` and `SessionLocal`.
  - Manages the connection pool to the PostgreSQL database.
  - Provides the `get_db` dependency used in API endpoints to ensure every request gets a fresh DB session that is closed afterwards.

- **`security.py`**: **Security Enforcer**.
  - **Password Hashing**: Uses `bcrypt` to hash passwords before storage. **Never store plain text passwords.**
  - **JWT Management**: Generates and validates JSON Web Tokens. This is the backbone of the stateless authentication system.

- **`scoring.py`**: **Game Mechanics Engine**.
  - Implements the **Dynamic Scoring Algorithm**.
  - **Logic**: `Points = MinPoints + (MaxPoints - MinPoints) / (1 + Decay * (Solves - 1))`
  - This ensures that challenges become worth fewer points as more teams solve them, rewarding "First Bloods" and early solvers.

- **`enum.py`**: **Domain Vocabulary**.
  - Defines the "language" of the domain using Python Enums.
  - `UserRole`: `ADMIN`, `PARTICIPANT`, `CAPTAIN`.
  - `EventStatus`: `NOT_STARTED`, `ACTIVE`, `FINISHED`.
  - `SubmissionStatus`: `CORRECT`, `INCORRECT`, `RATE_LIMITED`.
