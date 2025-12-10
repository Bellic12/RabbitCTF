"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
import os
from sqlalchemy import text
from app.core.database import engine, SessionLocal

def init_db():
    """Create all tables and seed initial data."""
    print("Initializing database...")
    print(f"Current directory: {os.getcwd()}")
    print(f"Database URL: {os.getenv('DATABASE_URL', 'not set')[:50]}...")
    
    db = SessionLocal()
    try:
        # Check if tables exist by trying to query role table
        try:
            result = db.execute(text("SELECT COUNT(*) FROM role"))
            tables_exist = True
            count = result.scalar()
            print(f"✓ Database tables exist ({count} roles found)")
        except Exception as e:
            tables_exist = False
            count = 0
            print(f"Tables don't exist, will create them. Error: {str(e)[:100]}")
        
        # If tables don't exist, create them
        if not tables_exist:
            print("Creating database tables from SQL...")
            
            # Try different paths for SQL files
            sql_paths = [
                '/app/db/init/01_create_db.sql',
                'db/init/01_create_db.sql',
                './db/init/01_create_db.sql',
                '../db/init/01_create_db.sql'
            ]
            
            sql_file = None
            for path in sql_paths:
                if os.path.exists(path):
                    sql_file = path
                    print(f"Found SQL file at: {path}")
                    break
            
            if not sql_file:
                print(f"⚠ SQL files not found in any path. Creating tables with SQLAlchemy...")
                from app.models import *
                from app.core.database import Base
                Base.metadata.create_all(bind=engine, checkfirst=True)
                print("✓ Tables created with SQLAlchemy")
            else:
                try:
                    with open(sql_file, 'r') as f:
                        sql = f.read()
                        statements = [s.strip() for s in sql.split(';') if s.strip()]
                        for statement in statements:
                            if statement and not statement.startswith('--'):
                                try:
                                    db.execute(text(statement))
                                    db.commit()
                                except Exception as e:
                                    db.rollback()
                                    if 'already exists' not in str(e).lower():
                                        print(f"⚠ Error in statement: {str(e)[:100]}")
                    print("✓ Database tables created successfully!")
                except Exception as e:
                    print(f"⚠ Error reading SQL file: {e}")
        
        # Seed data if needed
        if count == 0:
            print("Seeding initial data...")
            
            seed_paths = [
                '/app/db/init/02_seed_data.sql',
                'db/init/02_seed_data.sql',
                './db/init/02_seed_data.sql',
                '../db/init/02_seed_data.sql'
            ]
            
            seed_file = None
            for path in seed_paths:
                if os.path.exists(path):
                    seed_file = path
                    break
            
            if seed_file:
                try:
                    with open(seed_file, 'r') as f:
                        sql = f.read()
                        statements = [s.strip() for s in sql.split(';') if s.strip()]
                        for statement in statements:
                            if statement and not statement.startswith('--'):
                                try:
                                    db.execute(text(statement))
                                    db.commit()
                                except Exception as e:
                                    db.rollback()
                    
                    print("✓ Initial data seeded successfully!")
                except Exception as e:
                    print(f"⚠ Seed error: {e}")
            else:
                print("⚠ Seed file not found")
        else:
            print("✓ Database already contains data")
    
    except Exception as e:
        print(f"⚠ Database initialization error: {e}")
    finally:
        db.close()
    
    print("✓ Database initialization complete!")

if __name__ == "__main__":
    init_db()
