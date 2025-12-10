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
    """Create tables and seed minimal data on startup."""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Force create all tables (ignore duplicate errors)
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine, checkfirst=True)
        logger.info("Tables created successfully")
    except Exception as e:
        logger.warning(f"Table creation warning (may already exist): {e}")
    
    # Seed minimal data
    try:
        with SessionLocal() as db:
            # Check and seed roles
            count = db.execute(text("SELECT COUNT(*) FROM role")).scalar()
            if count == 0:
                logger.info("Seeding roles...")
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
                logger.info("Roles seeded")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        # Don't crash the app, let it try to run anyway
        pass


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
