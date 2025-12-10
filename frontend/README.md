# RabbitCTF Frontend

This is the client-side application for the RabbitCTF platform. It is a Single Page Application (SPA) built with modern web technologies to provide a responsive and interactive experience for CTF competitors and administrators.

## Tech Stack

- **Framework**: [React](https://react.dev/) (v18+)
- **Build Tool**: [Vite](https://vitejs.dev/) (Fast HMR and bundling)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Static typing for robustness)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) (Utility-first CSS with pre-built components)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: React Context API + Custom Hooks

## Architecture & Logic

The frontend is designed around a **Component-Based Architecture**.

### Key Features
1.  **Real-Time Event Synchronization**:
    - The app polls the backend (`useEventStatus`) to keep the **Event Timer** and **Submission Status** in sync.
    - If the event ends, the UI automatically updates to block new flag submissions.
2.  **Role-Based Access Control (RBAC)**:
    - The `AuthContext` decodes the JWT token to determine if the user is an `ADMIN` or `PARTICIPANT`.
    - `ProtectedRoute` components prevent unauthorized access to the Admin Dashboard.
3.  **Interactive Challenge Interface**:
    - Challenges are displayed in a grid.
    - The `ChallengeModal` handles file downloads and flag verification.
    - Immediate feedback (Success/Failure) is shown via **Toasts**.
4.  **Dynamic Leaderboard**:
    - Renders complex data (rankings, score history) using tables and charts (`Recharts` or similar).

## Project Structure

- **`src/`**: Source code.
  - **`components/`**: Reusable UI elements (Buttons, Modals, Cards).
  - **`context/`**: Global state (Auth, Toasts).
  - **`hooks/`**: Encapsulated logic (Data fetching, Timer logic).
  - **`pages/`**: Full-page views (Home, Challenges, Admin).
  - **`services/`**: API communication layer.
  - **`types/`**: TypeScript definitions.

## Integration with Backend

- **API Communication**: All data is fetched from the FastAPI backend via REST.
- **Authentication**: The frontend stores the JWT token in `localStorage` and attaches it to the `Authorization` header of every request.
- **Environment Variables**: The API URL is configured via `.env` (`VITE_API_URL`), allowing easy switching between Development and Production backends.

## Getting Started

1.  **Install dependencies**:
    ```bash
    pnpm install
    # or
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```
