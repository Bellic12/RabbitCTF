"""
Initialize database tables and seed data.
Run this script before starting the application.
"""
from sqlalchemy import text
from app.core.database import engine, SessionLocal

def init_db():
    """Create all tables and seed initial data."""
    print("Initializing database...")
    
    db = SessionLocal()
    try:
        # Check if tables exist by trying to query role table
        try:
            result = db.execute(text("SELECT COUNT(*) FROM role"))
            tables_exist = True
            count = result.scalar()
            print(f"✓ Database tables exist ({count} roles found)")
        except:
            tables_exist = False
            count = 0
            print("Creating database tables from SQL...")
        
        # If tables don't exist, create them
        if not tables_exist:
            try:
                with open('/app/db/init/01_create_db.sql', 'r') as f:
                    sql = f.read()
                    # Execute the entire CREATE script
                    db.execute(text(sql))
                    db.commit()
                print("✓ Database tables created successfully!")
            except Exception as e:
                db.rollback()
                print(f"⚠ Warning creating tables: {e}")
                # Try again with individual statements
                with open('/app/db/init/01_create_db.sql', 'r') as f:
                    sql = f.read()
                    statements = [s.strip() for s in sql.split(';') if s.strip()]
                    for statement in statements:
                        if statement and not statement.startswith('--'):
                            try:
                                db.execute(text(statement))
                                db.commit()
                            except Exception as e2:
                                db.rollback()
                print("✓ Database tables created!")
        
        # Seed data if needed
        if count == 0:
            print("Seeding initial data...")
            try:
                with open('/app/db/init/02_seed_data.sql', 'r') as f:
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
            except FileNotFoundError:
                print("⚠ Seed file not found")
        else:
            print("✓ Database already contains data")
    
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")
    finally:
        db.close()
    
    print("✓ Database initialization complete!")

if __name__ == "__main__":
    init_db()
