"""
Main FastAPI application for RabbitCTF.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.api.v1.router import api_router
from app.core.database import Base, engine, SessionLocal
import app.models  # noqa: F401 ensure models are registered

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for RabbitCTF - Capture The Flag Platform",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


# Ensure DB tables exist on startup (idempotent)
@app.on_event("startup")
def startup_event():
    # Create all tables if missing
    Base.metadata.create_all(bind=engine, checkfirst=True)

    # Optionally seed core reference data if empty
    with SessionLocal() as db:
        try:
            count = db.execute(text("SELECT COUNT(*) FROM role")).scalar()
            if count == 0:
                db.execute(text(
                    """
                    INSERT INTO role (name, description) VALUES
                    ('admin', 'System administrator with full access'),
                    ('captain', 'Team captain with team management permissions'),
                    ('user', 'Regular user/competitor')
                    ON CONFLICT (name) DO NOTHING
                    """
                ))
                db.commit()
        except Exception:
            db.rollback()


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "running",
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
