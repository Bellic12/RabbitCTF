# Services (API Client)

This directory contains the logic for communicating with the Backend API. It abstracts the HTTP details (headers, base URLs) from the components.

## Files

- **`api.ts`**:
  - **Configuration**: Sets up the base URL (from `VITE_API_URL` environment variable).
  - **Interceptors**: Likely handles the automatic attachment of the `Authorization: Bearer <token>` header to every request.
  - **Error Handling**: Centralized error processing (e.g., redirecting to login on 401 Unauthorized).
