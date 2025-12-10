# Services Layer (Business Logic)

This directory is the heart of the application logic. It implements the rules of the game. The API layer (Controllers) delegates all complex processing to these services. This separation of concerns keeps the API routes "thin" and the logic reusable and testable.

## Core Business Logic

### `submission_service.py`
This is the most complex service, handling the core loop of the CTF:
1.  **Event Status Check**: Verifies if the event is `ACTIVE`. If not, rejects the submission.
2.  **Rate Limiting**: Prevents brute-force attacks by limiting how fast a user can submit flags.
3.  **Flag Validation**: Compares the submitted string against the stored flag (case-sensitive or insensitive).
4.  **Scoring**: If correct, calculates points based on the **Dynamic Scoring** formula and updates the team's score.
5.  **First Blood**: Detects if this is the first solve for a challenge and awards extra recognition.

### `challenge_service.py`
- **Visibility Rules**: Determines which challenges a user can see. For example, some challenges might be locked until a prerequisite is solved.
- **File Management**: Handles the secure upload and download of challenge artifacts (PDFs, binaries).

### `team_service.py`
- **Team Formation**: Logic for creating teams, generating invite codes, and joining teams.
- **Constraints**: Enforces maximum team size (e.g., 4 members).

### `leaderboard_service.py`
- **Ranking Calculation**: Aggregates scores from all submissions.
- **Tie-Breaking**: If two teams have the same score, the one who reached it first (earlier last submission time) is ranked higher.
- **Caching**: (Future optimization) This service is the candidate for caching leaderboard data to reduce DB load.

Services interact directly with the **SQLAlchemy Models** to persist state changes.
