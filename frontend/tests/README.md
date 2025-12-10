# RabbitCTF Frontend Testing Suite

This directory contains the automated testing suite for the RabbitCTF frontend. The tests are built using **Vitest**, **React Testing Library**, and **JSDOM**.

## Directory Structure

```
tests/
├── setup.ts             # Global test setup (extends expect matchers)
├── unit/                # Tests for individual components (isolated)
└── integration/         # Tests for pages and user flows (mocked API)
├── services/            # Tests for API service layer
└── e2e/                 # End-to-End tests using Playwright
```

## 1. Unit Tests (`tests/unit/`)

These tests verify that individual UI components render correctly and handle props as expected.

| File | What it Tests | How it Tests |
|------|---------------|--------------|
| `Badges.test.tsx` | **Badge Components** | • Renders `DifficultyBadge` and `CategoryBadge`.<br>• Verifies that the correct CSS classes (colors) are applied based on the difficulty prop.<br>• Checks that the text content is rendered correctly. |
| `ChallengeCard.test.tsx` | **Challenge Card** | • Renders challenge details (title, points, tags).<br>• Verifies click interactions.<br>• Checks conditional styling for solved/unsolved states. |

## 2. Integration Tests (`tests/integration/`)

These tests verify the interaction between components, hooks, and mocked API calls. They simulate user behavior.

| File | What it Tests | How it Tests |
|------|---------------|--------------|
| `Login.test.tsx` | **Login Page Flow** | • **Form Rendering**: Checks if inputs and buttons exist.<br>• **Validation**: Verifies error messages for empty/short inputs.<br>• **API Success**: Mocks `fetch` to return a success token, fills the form, submits, and checks if `login()` context function is called.<br>• **API Failure**: Mocks `fetch` to return an error (401), submits, and verifies the error message is displayed. |
| `Register.test.tsx` | **Register Page Flow** | • **Validation**: Checks password complexity and matching logic.<br>• **API Interaction**: Mocks `fetch` for registration endpoint.<br>• **Navigation**: Verifies redirection to login page on success. |

## 3. Service Tests (`tests/services/`)

These tests verify the API service layer directly, ensuring that the correct endpoints and headers are used.

| File | What it Tests |
|------|---------------|
| `api.test.ts` | Verifies `auth`, `challenges`, and `scoreboard` service methods against mocked `fetch` calls. |

## 4. E2E Tests (`tests/e2e/`)

These tests use **Playwright** to run the application in a real browser environment (Chromium) with mocked backend responses. They test complete user journeys.

| File | What it Tests |
|------|---------------|
| `functional.spec.ts` | • **Login Flow**: User logs in and is redirected to the dashboard.<br>• **Challenge Flow**: User views challenges, opens a challenge, and submits a flag (verifying both correct and incorrect submissions). |
| `teams.spec.ts` | • **Team Creation**: User creates a new team (verifying modal interaction and success state).<br>• **Team Joining**: User joins an existing team using credentials. |
| `scoreboard.spec.ts` | • **Leaderboard View**: Verifies that the scoreboard renders correctly with team names, scores, and ranks. |
| `profile.spec.ts` | • **Logout Flow**: Verifies that the user can log out and is redirected to the login page. |

## How to Run Tests

Run Unit & Integration tests (Vitest):
```bash
pnpm test
```

Run E2E tests (Playwright):
```bash
pnpm exec playwright test
```

Run tests in UI mode (interactive):
```bash
pnpm test --ui
```

Run tests with coverage:
```bash
pnpm test --coverage
```

## Configuration

*   **`vite.config.ts`**: Configures Vitest to use `jsdom` environment and load `tests/setup.ts`.
*   **`tests/setup.ts`**: Imports `@testing-library/jest-dom` to add custom matchers like `toBeInTheDocument()` and `toHaveClass()`.
