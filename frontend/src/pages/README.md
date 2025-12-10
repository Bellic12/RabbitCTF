# Pages (Views)

This directory contains the top-level components that correspond to specific routes in the application. They compose smaller components to build full views.

## Public Pages
- **`Home.tsx`**: The landing page. Displays the Hero section, the Event Timer, and general information about the CTF.
- **`Login.tsx` / `Register.tsx`**: Authentication forms.
- **`Rules.tsx`**: Displays the competition rules.

## Protected Pages (Participants)
- **`Challenges.tsx`**: The main game interface. Displays the grid of challenges filtered by category.
- **`Leaderboard.tsx`**: Shows the current rankings and score graph.
- **`Team.tsx`**: Team management interface. Allows users to create a team, join via code, or view their team's progress.

## Protected Pages (Admin)
- **`Admin.tsx`**: The administrative dashboard. It uses a tabbed interface to switch between:
  - Event Configuration (`EventSettings`)
  - Challenge Management (`ChallengeManagement`)
  - User/Team Management (`UserManagement`)
  - System Logs (`ActivityLog`)
