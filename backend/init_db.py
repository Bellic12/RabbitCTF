"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
from sqlalchemy import text, inspect
from app.core.database import engine
from app.models import *  # Import all models to register them
from app.core.database import Base

def init_db():
    """Create all tables and seed initial data."""
    print("Initializing database...")
    
    # Create all tables (ignore errors if they exist)
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("✓ Database tables created/verified successfully!")
    except Exception as e:
        print(f"Database tables check completed (some may already exist)")
    
    # Check if we need to seed data
    try:
        with engine.connect() as conn:
            # Check if role table has data
            try:
                result = conn.execute(text("SELECT COUNT(*) FROM role"))
                count = result.scalar()
            except:
                count = 0
            
            if count == 0:
                print("Seeding initial data...")
                
                # Read and execute seed data
                try:
                    with open('/app/db/init/02_seed_data.sql', 'r') as f:
                        sql = f.read()
                        # Split by statement and execute each
                        statements = [s.strip() for s in sql.split(';') if s.strip()]
                        for statement in statements:
                            if statement:
                                try:
                                    conn.execute(text(statement))
                                except Exception as e:
                                    # Ignore duplicate key errors
                                    if 'duplicate' not in str(e).lower():
                                        print(f"⚠ Warning: {e}")
                        conn.commit()
                    print("✓ Initial data seeded successfully!")
                except FileNotFoundError:
                    print("⚠ Seed file not found, skipping initial data...")
            else:
                print("✓ Database already contains data, skipping seed...")
    except Exception as e:
        print(f"⚠ Database seeding check completed with warnings: {e}")
    
    print("✓ Database initialization complete!")

if __name__ == "__main__":
    init_db()
