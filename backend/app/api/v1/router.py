"""
Main API router that includes all endpoint routers.
"""

from fastapi import APIRouter
from app.api.v1 import auth, challenges, scoreboard, rules, admin

# Create main API router
api_router = APIRouter()

# Include authentication router
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include admin router
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Include scoreboard router
api_router.include_router(
    scoreboard.router,
    prefix="/scoreboard",
    tags=["Scoreboard"]
)

# Include rules router
api_router.include_router(
    rules.router,
    prefix="/rules",
    tags=["Rules"]
)

# TODO: Add more routers as they are implemented
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
# api_router.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])
