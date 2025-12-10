# Custom Hooks

This directory contains custom React Hooks that encapsulate complex logic and side effects (data fetching, subscriptions). They separate the *behavior* from the *presentation* (Components).

## Hooks

- **`useEventStatus.ts`**: **Real-time Synchronization**.
  - **Logic**: Polls the `/api/v1/event/status` endpoint every 5 seconds.
  - **Usage**: Used by `EventTimer` to display the countdown and by `ChallengeModal` to block submissions if the event is not `ACTIVE`.

- **`useChallenges.ts`**: **Data Fetching**.
  - **Logic**: Fetches the list of challenges and categories. Handles loading states and error handling.

- **`useScoreboard.ts`**: **Leaderboard Logic**.
  - **Logic**: Fetches the current rankings. May implement polling or WebSocket connections in the future for live updates.

- **`useStats.ts`**: **Analytics**.
  - **Logic**: Fetches statistics for the Admin dashboard or User profile (e.g., solve counts, category breakdown).
