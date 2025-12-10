# Database Models (Data Layer)

This directory contains the SQLAlchemy ORM (Object Relational Mapper) models. These classes define the structure of the database tables and the relationships between them. They are the single source of truth for the data schema.

## Entity-Relationship Overview

The system is built around the interaction between **Users**, **Teams**, and **Challenges**.

### Core Entities
- **`user.py`**: Represents a registered participant.
  - **Logic**: Stores `hashed_password` (never plain text). Linked to a `Team`.
- **`team.py`**: A group of users competing together.
  - **Logic**: Has a `captain_id` (leader). Aggregates the score of its members.
- **`challenge.py`**: A puzzle to be solved.
  - **Logic**: Contains the `flag` (secret string). Can be `hidden` or `visible`.

### Operational Entities
- **`submission.py`**: The record of an attempt to solve a challenge.
  - **Importance**: This is the most high-volume table. It tracks `is_correct`, timestamp, and prevents duplicate solves for points.
- **`event_config.py`**: Singleton configuration for the event.
  - **Importance**: Controls the global state (`start_time`, `end_time`, `status`). The entire app checks this table to decide if submissions are allowed.

### Relationships
- **User <-> Team**: Many-to-One (A user belongs to one team).
- **Team <-> Submission**: One-to-Many (A team has many submissions).
- **Challenge <-> Submission**: One-to-Many (A challenge has many submissions).

These models are used by the **Services** layer to perform CRUD operations and complex queries.
