import os
import asyncio
import asyncpg
from urllib.parse import urlparse

async def run_sql_file(conn, file_path):
    print(f"Executing {file_path}...")
    with open(file_path, 'r') as f:
        sql = f.read()
        # Split by semicolon to execute statements individually if needed, 
        # but asyncpg execute usually handles blocks well.
        # For complex scripts with $$ blocks, it's better to execute as one block if possible
        # or split carefully. Here we try executing the whole file.
        try:
            await conn.execute(sql)
            print(f"Successfully executed {file_path}")
        except Exception as e:
            print(f"Error executing {file_path}: {e}")

async def main():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL environment variable not set.")
        return

    # Fix URL for asyncpg if needed (postgres:// -> postgresql://)
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    print(f"Connecting to database...")
    
    try:
        conn = await asyncpg.connect(database_url)
        
        # Order matters: Schema first, then data
        files = [
            "db/init/01_create_db.sql",
            "db/init/02_seed_data.sql"
        ]
        
        for file in files:
            if os.path.exists(file):
                await run_sql_file(conn, file)
            else:
                print(f"File not found: {file}")
                
        await conn.close()
        print("Database initialization completed.")
        
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
