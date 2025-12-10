# Components

This directory contains the reusable UI building blocks of the application. They are divided into general-purpose components and admin-specific components.

## General Components

- **`Navigation.tsx`**: The main navigation bar. It adapts based on the user's authentication state (Login/Register vs Logout/Profile) and role (Admin link).
- **`EventTimer.tsx`**: **Critical**. Displays the countdown to the event start or end. It polls the backend for real-time status updates.
- **`ChallengeCard.tsx`**: Displays a summary of a challenge (Title, Points, Category, Solves). Click to open the modal.
- **`ChallengeModal.tsx`**: **Interaction Hub**. Handles the detailed view of a challenge, file downloads, and **Flag Submission**. It integrates with `useEventStatus` to block submissions when the event is not active.
- **`RankingTable.tsx`**: Displays the leaderboard. Handles pagination and sorting.
- **`ScoreChart.tsx`**: Visualizes the score progression of top teams over time using a line chart.
- **`Toast.tsx`**: Displays non-blocking notifications (Success, Error, Info) with a high z-index to ensure visibility.
- **`ProtectedRoute.tsx`**: A wrapper component that redirects unauthenticated users or unauthorized roles (e.g., non-admins trying to access `/admin`).

## Admin Components (`admin/`)

- **`EventSettings.tsx`**: **Control Center**. Allows admins to set the event start/end times, force status changes, and configure the timezone.
- **`ChallengeManagement.tsx`**: CRUD interface for challenges.
- **`UserManagement.tsx`**: Interface to manage users and teams.
- **`ActivityLog.tsx`**: Displays a log of system events (submissions, logins, etc.).
