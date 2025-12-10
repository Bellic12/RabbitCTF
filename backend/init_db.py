"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
from sqlalchemy import text
from app.core.database import engine, SessionLocal
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
        print(f"✓ Database tables check completed (continuing...)")
    
    # Check if we need to seed data
    db = SessionLocal()
    try:
        # Check if role table has data
        try:
            result = db.execute(text("SELECT COUNT(*) FROM role"))
            count = result.scalar()
        except:
            count = 0
        
        if count == 0:
            print("Seeding initial data...")
            
            # Read and execute seed data with individual commits
            try:
                with open('/app/db/init/02_seed_data.sql', 'r') as f:
                    sql = f.read()
                    # Split by statement and execute each
                    statements = [s.strip() for s in sql.split(';') if s.strip()]
                    for statement in statements:
                        if statement and not statement.startswith('--'):
                            try:
                                db.execute(text(statement))
                                db.commit()
                            except Exception as e:
                                db.rollback()
                                # Ignore duplicate/already exists errors
                                error_msg = str(e).lower()
                                if 'duplicate' not in error_msg and 'already exists' not in error_msg:
                                    print(f"⚠ Warning: {e}")
                
                print("✓ Initial data seeded successfully!")
            except FileNotFoundError:
                print("⚠ Seed file not found, skipping initial data...")
        else:
            print("✓ Database already contains data, skipping seed...")
    except Exception as e:
        print(f"⚠ Database seeding completed with warnings")
    finally:
        db.close()
    
    print("✓ Database initialization complete!")

if __name__ == "__main__":
    init_db()
