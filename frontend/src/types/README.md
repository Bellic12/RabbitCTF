# TypeScript Types

This directory contains the TypeScript interface and type definitions. These are shared across components and hooks to ensure type safety.

## Files

- **`challenge.ts`**: Defines the structure of a Challenge (`id`, `title`, `points`, `category`, `solves`) and Submission responses.
- **`admin.ts`**: Types for admin-specific data structures (e.g., `EventConfig`, `UserAdminView`).
- **`leaderboard.ts`**: Types for the scoreboard data (`TeamRank`, `ScoreHistory`).

Using these shared types ensures that if the Backend API response structure changes, we can update the type definition in one place and catch all breaking changes at compile time.
