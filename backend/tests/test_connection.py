"""
Script para verificar la conexión a la base de datos PostgreSQL.
Ejecutar desde: backend/
Comando: python tests/test_connection.py
"""
import sys
from pathlib import Path

# Agregar el directorio backend al path para poder importar app
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import engine, DATABASE_URL
from sqlalchemy import text

# print("🔌 Verificando conexión a PostgreSQL...")

def test_connection():
    """Prueba la conexión a la base de datos."""
    
    print("🔌 Verificando conexión a PostgreSQL...")
    print("=" * 70)
    
    try:
        # Importar después de ajustar el path
        from app.core.database import engine, DATABASE_URL
        from sqlalchemy import text
        
        # Mostrar URL de conexión (ocultando password)
        safe_url = str(DATABASE_URL).replace(
            DATABASE_URL.split('@')[0].split(':')[-1] if '@' in str(DATABASE_URL) else '',
            '****'
        )
        print(f"URL: {safe_url}\n")
        
        # Intentar conectar
        with engine.connect() as conn:
            # Query 1: Versión de PostgreSQL
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            
            print("¡CONEXIÓN EXITOSA!\n")
            print(f"PostgreSQL Version:")
            print(f"   {version[:80]}...\n")
            
            print(f" Información de la Base de Datos:")
            print(f"   Database: {engine.url.database}")
            print(f"   User:     {engine.url.username}")
            print(f"   Host:     {engine.url.host}")
            print(f"   Port:     {engine.url.port}\n")
            
            # Query 2: Tablas existentes
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            
            if tables:
                print(f" Tablas Encontradas ({len(tables)}):")
                for table in tables:
                    print(f"   > {table[0]}")
            else:
                print("  No se encontraron tablas en la base de datos")
                print("   (Base de datos está vacía o los scripts SQL no se han ejecutado)")
            
            # Query 3: Contar registros en tablas principales
            if tables:
                print(f"\n Registros en Tablas Principales:")
                main_tables = ['role', 'difficulty', 'user', 'team', 'challenge', 'challenge_category']
                for table_name in main_tables:
                    if any(t[0] == table_name for t in tables):
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name};"))
                        count = result.fetchone()[0]
                        print(f"   {table_name:20} → {count} registros")
            
            print("\n" + "=" * 70)
            print(" ¡Prueba de conexión completada exitosamente!")
            return True
            
    except ImportError as e:
        print(f" Error de importación: {e}")
        print("\n Solución:")
        print("   Instala las dependencias: pip install sqlalchemy psycopg2-binary")
        return False
        
    except Exception as e:
        print(f" Error de conexión: {e}\n")
        print(" Verifica:")
        print("   1. Docker está corriendo:")
        print("      → docker ps")
        print("   2. Contenedor de PostgreSQL activo:")
        print("      → docker-compose ps")
        print("   3. Variables de entorno correctas:")
        print("      → DATABASE_URL en .env o variable de sistema")
        print("   4. Credenciales correctas:")
        print("      → Usuario: rabbitctf_user")
        print("      → Database: rabbitctf_db")
        print("      → Port: 5432")
        return False

if __name__ == "__main__":
    success = test_connection()
    print()
    sys.exit(0 if success else 1)