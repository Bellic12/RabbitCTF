"""
Script para probar el control de acceso basado en roles.
Ejecutar desde: backend/
Comando: python tests/test_roles.py
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def test_role_based_access():
    """Prueba el control de acceso basado en roles."""

    print(" Probando Control de Acceso Basado en Roles...")
    print("=" * 50)

    try:
        from app.core.database import SessionLocal
        from app.services.auth_service import AuthService
        from app.schemas.auth import UserLogin
        from jose import jwt
        from app.core.config import settings

        db = SessionLocal()
        auth_service = AuthService(db)

        # Test 1: Login con usuario normal
        print("\n Test 1: Login con usuario normal (alice)")
        print("-" * 50)
        login_data = UserLogin(username="alice", password="password123")
        token_response = auth_service.login(login_data)

        # Decodificar token para ver el payload
        payload = jwt.decode(
            token_response.access_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        print("   Token generado exitosamente")
        print(f"   User ID (sub): {payload.get('sub')}")
        print(f"   Username: {payload.get('username')}")
        print(f"   Role: {payload.get('role')}")
        print(f"   Expires (exp): {payload.get('exp')}")

        if payload.get("role") == "user":
            print("  Usuario normal - rol correcto")
        else:
            print("  Error: se esperaba rol 'user'")

        # Test 2: Login con moderador
        print("\n Test 2: Login con moderador")
        print("-" * 50)
        login_data = UserLogin(username="moderator", password="password123")
        token_response = auth_service.login(login_data)

        payload = jwt.decode(
            token_response.access_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        print("   Token generado exitosamente")
        print(f"   User ID (sub): {payload.get('sub')}")
        print(f"   Username: {payload.get('username')}")
        print(f"   Role: {payload.get('role')}")

        if payload.get("role") == "moderator":
            print("  Moderador - rol correcto")
        else:
            print("  Error: se esperaba rol 'moderator'")

        # Test 3: Login con admin
        print("\n Test 3: Login con admin")
        print("-" * 50)
        login_data = UserLogin(username="admin", password="admin123")
        token_response = auth_service.login(login_data)

        payload = jwt.decode(
            token_response.access_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        print("   Token generado exitosamente")
        print(f"   User ID (sub): {payload.get('sub')}")
        print(f"   Username: {payload.get('username')}")
        print(f"   Role: {payload.get('role')}")

        if payload.get("role") == "admin":
            print(" Admin - rol correcto")
        else:
            print(" Error: se esperaba rol 'admin'")

        return True

    except Exception as e:
        print(f"\n Error: {e}")
        import traceback

        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    success = test_role_based_access()
    sys.exit(0 if success else 1)
