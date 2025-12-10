"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
import os
from sqlalchemy import text
from app.core.database import engine, SessionLocal
"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
import os
from sqlalchemy import text
from app.core.database import engine, SessionLocal
from app.core.database import Base
import app.models  # noqa: F401 ensures models are registered


def init_db():
    """Create all tables and seed initial data."""
    print("Initializing database...")
    print(f"Current directory: {os.getcwd()}")
    print(f"Database URL: {os.getenv('DATABASE_URL', 'not set')[:60]}...")

    db = SessionLocal()
    try:
        # Try to detect if tables already exist
        try:
            result = db.execute(text("SELECT COUNT(*) FROM role"))
            count = result.scalar()
            print(f"✓ Database tables exist ({count} roles found)")
            tables_exist = True
        except Exception as e:
            print(f"Tables do not exist yet. Error: {str(e)[:120]}")
            tables_exist = False
            count = 0

        # Create tables with SQLAlchemy metadata first (checkfirst avoids duplicates)
        try:
            Base.metadata.create_all(bind=engine, checkfirst=True)
            print("✓ SQLAlchemy metadata create_all completed")
            tables_exist = True
        except Exception as e:
            print(f"⚠ create_all warning: {str(e)[:120]}")

        # If still no tables, fallback to SQL files
        if not tables_exist:
            print("Creating database tables from SQL files...")
            sql_paths = [
                '/app/db/init/01_create_db.sql',
                'db/init/01_create_db.sql',
                './db/init/01_create_db.sql',
                '../db/init/01_create_db.sql',
            ]
            sql_file = next((p for p in sql_paths if os.path.exists(p)), None)
            if sql_file:
                print(f"Using SQL file: {sql_file}")
                with open(sql_file, 'r') as f:
                    statements = [s.strip() for s in f.read().split(';') if s.strip()]
                    for stmt in statements:
                        if stmt and not stmt.startswith('--'):
                            try:
                                db.execute(text(stmt))
                                db.commit()
                            except Exception as e:
                                db.rollback()
                                if 'exists' not in str(e).lower():
                                    print(f"⚠ SQL error: {str(e)[:120]}")
                print("✓ Tables created from SQL file")
            else:
                print("⚠ No SQL file found; relying on SQLAlchemy create_all")

        # Seed data if empty
        if count == 0:
            print("Seeding initial data...")
            seed_paths = [
                '/app/db/init/02_seed_data.sql',
                'db/init/02_seed_data.sql',
                './db/init/02_seed_data.sql',
                '../db/init/02_seed_data.sql',
            ]
            seed_file = next((p for p in seed_paths if os.path.exists(p)), None)
            if seed_file:
                with open(seed_file, 'r') as f:
                    statements = [s.strip() for s in f.read().split(';') if s.strip()]
                    for stmt in statements:
                        if stmt and not stmt.startswith('--'):
                            try:
                                db.execute(text(stmt))
                                db.commit()
                            except Exception as e:
                                db.rollback()
                                if 'duplicate' not in str(e).lower():
                                    print(f"⚠ Seed error: {str(e)[:120]}")
                print("✓ Initial data seeded successfully!")
            else:
                print("⚠ Seed file not found; skipping seed")
        else:
            print("✓ Database already contains data; skipping seed")

    except Exception as e:
        print(f"⚠ Database initialization error: {str(e)[:200]}")
    finally:
        db.close()

    print("✓ Database initialization complete!")


if __name__ == "__main__":
    init_db()
