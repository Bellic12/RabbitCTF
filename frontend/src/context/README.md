# Context Providers

This directory contains React Context definitions used for global state management. This ensures critical data is available throughout the component tree.

## Contexts

- **`AuthContext.tsx`**: **Authentication State**.
  - **Responsibility**: Manages the user's login session.
  - **Logic**: Checks for a JWT token in `localStorage` on initialization. Provides `login`, `logout`, and `user` object (username, role, team) to the rest of the app.
  - **Security**: Decodes the JWT to determine if the user is an `ADMIN` or `PARTICIPANT`.

- **`ToastContext.tsx`**: **Notification System**.
  - **Responsibility**: Manages the queue of toast messages.
  - **Logic**: Exposes a `showToast(message, type, duration)` function. It handles the auto-dismissal of messages after the specified duration.
