"""
Script para probar el endpoint de login.
Ejecutar desde: backend/
Comando: python tests/test_login.py
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def test_login():
    """Prueba el servicio de autenticación."""

    print(" Probando servicio de autenticación...")
    print("=" * 70)

    try:
        from app.core.database import SessionLocal
        from app.services.auth_service import AuthService
        from app.schemas.auth import UserLogin

        # Crear sesión
        db = SessionLocal()
        auth_service = AuthService(db)

        print(" Paso 1: Servicio de autenticación inicializado\n")

        # Probar login con usuario admin
        print(" Paso 2: Probando login con usuario 'admin'...")

        try:
            login_data = UserLogin(username="admin", password="admin123")
            token = auth_service.login(login_data)

            print("   > Login exitoso!")
            print(f"   Token Type: {token.token_type}")
            print(f"   Access Token: {token.access_token[:50]}...")
            print()

        except Exception as e:
            print(f"    Error en login: {e}\n")
            return False

        # Probar login fallido
        print(" Paso 3: Probando login con credenciales incorrectas...")

        try:
            login_data = UserLogin(username="admin", password="wrong_password")
            token = auth_service.login(login_data)
            print("    Login debería haber fallado pero no lo hizo\n")
            return False
        except Exception as e:
            print(f"    Login falló correctamente: {str(e)[:50]}...\n")

        # Probar obtener usuario por username
        print(" Paso 4: Probando obtener usuario por username...")

        user = auth_service.get_user_by_username("admin")
        if user:
            print(f"    Usuario encontrado: {user}")
            print(f"     - ID: {user.id}")
            print(f"     - Username: {user.username}")
            print(f"     - Email: {user.email}")
            print(f"     - Role ID: {user.role_id}")
            print()
        else:
            print("    Usuario no encontrado\n")
            return False

        # Listar usuarios disponibles
        print(" Paso 5: Listando usuarios de prueba disponibles...")
        from app.models.user import User

        users = db.query(User).limit(5).all()

        print(f"   Total usuarios: {db.query(User).count()}")
        for u in users:
            print(f"   - {u.username} ({u.email})")
        print()

        db.close()

        print("=" * 70)
        print(" ¡Todos los tests de login pasaron exitosamente!")
        print("\n Endpoints disponibles:")
        print("   POST /api/v1/auth/login")
        print("   POST /api/v1/auth/register")
        print("   POST /api/v1/auth/token")
        print("   GET  /api/v1/auth/me")
        print("\n Prueba el login desde el frontend:")
        print("   URL: http://localhost:8000/api/v1/auth/login")
        print('   Body: {"username": "admin", "password": "admin123"}')

        return True

    except ImportError as e:
        print(f" Error de importación: {e}")
        print("\n Solución:")
        print("   pip install -r requirements.txt")
        return False

    except Exception as e:
        print(f" Error: {e}")
        import traceback

        print(f"\n{traceback.format_exc()}")
        return False


if __name__ == "__main__":
    success = test_login()
    print()
    sys.exit(0 if success else 1)
