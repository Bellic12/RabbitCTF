# Database Initialization & Migration

This directory manages the lifecycle of the PostgreSQL database schema and initial data.

## Initialization Process
When the Docker container for the database starts for the first time, it executes the scripts in `init/` in alphabetical order.

### `init/` Scripts
1.  **`01_create_db.sql`**:
    - Sets up the fundamental database structure if not handled by the ORM.
    - **Importance**: Ensures the database exists before the application tries to connect.

2.  **`02_seed_data.sql`**:
    - **Bootstrapping**: Inserts the default `admin` user (credentials: `admin`/`admin123`).
    - **Development Data**: Populates the system with sample challenges, categories, and dummy teams for local development.
    - **Business Logic Impact**: Without this, a fresh deployment would be empty and unusable until an admin manually configured everything.

## Future Improvements (Migrations)
Currently, the schema is largely managed by SQLAlchemy's `Base.metadata.create_all()`. In a production environment, this folder would also contain **Alembic** migration scripts (`versions/`) to handle schema changes (e.g., adding a column) without losing data.
