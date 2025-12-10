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
    print("Checking database state...")
    
    # Check if tables exist
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if not existing_tables or 'user' not in existing_tables:
        print("Creating database tables...")
        try:
            Base.metadata.create_all(bind=engine, checkfirst=True)
            print("✓ Database tables created successfully!")
        except Exception as e:
            print(f"⚠ Warning during table creation: {e}")
            print("Continuing anyway...")
    else:
        print("✓ Database tables already exist, skipping creation...")
    
    # Check if we need to seed data
    try:
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
                            try:
                                conn.execute(text(statement))
                            except Exception as e:
                                print(f"⚠ Warning executing statement: {e}")
                    conn.commit()
                
                print("✓ Initial data seeded successfully!")
            else:
                print("✓ Database already seeded, skipping...")
    except Exception as e:
        print(f"⚠ Warning during seeding: {e}")
        print("Continuing anyway...")

if __name__ == "__main__":
    init_db()
