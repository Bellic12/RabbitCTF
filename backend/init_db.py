"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
from sqlalchemy import text
from app.core.database import engine
from app.models import *  # Import all models to register them
from app.core.database import Base

def init_db():
    """Create all tables and seed initial data."""
    print("Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✓ Database tables created successfully!")
    
    # Check if we need to seed data
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM role"))
        count = result.scalar()
        
        if count == 0:
            print("Seeding initial data...")
            
            # Read and execute seed data
            with open('/app/db/init/02_seed_data.sql', 'r') as f:
                sql = f.read()
                # Split by statement and execute each
                statements = [s.strip() for s in sql.split(';') if s.strip()]
                for statement in statements:
                    if statement:
                        conn.execute(text(statement))
                conn.commit()
            
            print("✓ Initial data seeded successfully!")
        else:
            print("✓ Database already seeded, skipping...")

if __name__ == "__main__":
    init_db()
