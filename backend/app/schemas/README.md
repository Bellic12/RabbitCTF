# Pydantic Schemas (Data Transfer Objects)

This directory contains the Pydantic models used for **Data Validation** and **Serialization**. They define the contract between the Frontend and the Backend.

## Why is this layer critical?

1.  **Input Validation**: Before any data reaches the business logic, Pydantic ensures it meets the expected format (e.g., email is valid, password is long enough, dates are correct). This prevents "Garbage In".
2.  **Output Sanitization**: Pydantic models filter the data returned to the user. For example, a `User` database model contains the `hashed_password`, but the `UserResponse` schema **excludes** it. This prevents "Data Leaks".
3.  **Documentation**: These schemas automatically generate the OpenAPI (Swagger) documentation.

## Key Schemas

- **`auth.py`**:
  - `UserCreate`: Validates registration data (username uniqueness, password strength).
  - `Token`: Defines the structure of the JWT response.
- **`submissions.py`**:
  - `SubmissionBase`: The minimal data needed to submit a flag (`challenge_id`, `flag_string`).
  - `SubmissionResponse`: The feedback returned to the user (`is_correct`, `message`).
- **`challenges.py`**:
  - `ChallengeCreate`: Used by Admins to create challenges.
  - `ChallengeRead`: Used by Participants. **Crucially**, this schema does NOT include the `flag` field, ensuring the answer is never sent to the client.
- **`event.py`**:
  - `EventConfigUpdate`: Validates that `end_time` > `start_time`.

This layer ensures that the API is robust, secure, and self-documenting.
