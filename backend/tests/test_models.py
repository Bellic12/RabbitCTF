"""
Test simple para validar que los modelos SQLAlchemy funcionan correctamente.
Ejecutar desde: backend/
Comando: python tests/test_models.py
"""
import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def test_models():
    """Prueba básica de los modelos ORM."""
    
    print(" Probando modelos SQLAlchemy del ORM...")
    print("=" * 70)
    
    try:
        # Importar después de ajustar el path
        from app.core.database import engine, SessionLocal, Base
        from app.models import (
            Role, Difficulty, User, UserCredential, Team, TeamMember,
            ChallengeCategory, Challenge, ChallengeScoreConfig,
            Submission, Notification, AuditLog
        )
        
        print(" Paso 1: Importación de modelos exitosa\n")
        
        # Verificar que las tablas coinciden
        print(" Paso 2: Verificando metadatos de tablas...")
        tables = Base.metadata.tables
        print(f"   Modelos definidos: {len(tables)} tablas")
        for table_name in sorted(tables.keys()):
            print(f"    {table_name}")
        print()
        
        # Crear sesión
        db = SessionLocal()
        
        print(" Paso 3: Conexión a base de datos exitosa\n")
        
        # Test 1: Consultar datos de referencia
        print(" Paso 4: Probando consultas básicas...")
        
        # Roles
        roles = db.query(Role).all()
        print(f"    Roles encontrados: {len(roles)}")
        for role in roles:
            print(f"     - {role}")
        
        # Dificultades
        difficulties = db.query(Difficulty).order_by(Difficulty.sort_order).all()
        print(f"   Dificultades encontradas: {len(difficulties)}")
        for diff in difficulties:
            print(f"     - {diff}")
        
        # Categorías
        categories = db.query(ChallengeCategory).all()
        print(f"    Categorías encontradas: {len(categories)}")
        for cat in categories[:3]:  # Solo primeras 3
            print(f"     - {cat}")
        if len(categories) > 3:
            print(f"     ... y {len(categories) - 3} más")
        print()
        
        # Test 2: Probar relaciones
        print(" Paso 5: Probando relaciones entre modelos...")
        
        # Usuario con su rol
        user = db.query(User).filter_by(username="admin").first()
        if user:
            print(f"    Usuario: {user}")
            print(f"     - Rol: {user.role.name if user.role else 'N/A'}")
            print(f"     - Tiene credencial: {user.credential is not None}")
        
        # Equipo con capitán y miembros
        team = db.query(Team).first()
        if team:
            print(f"    Equipo: {team}")
            print(f"     - Capitán: {team.captain.username if team.captain else 'N/A'}")
            print(f"     - Miembros: {len(team.members)}")
            for member in team.members:
                print(f"       • {member.user.username}")
        
        # Challenge con sus configuraciones
        challenge = db.query(Challenge).filter_by(is_draft=False).first()
        if challenge:
            print(f"    Challenge: {challenge}")
            print(f"     - Categoría: {challenge.category.name if challenge.category else 'N/A'}")
            print(f"     - Dificultad: {challenge.difficulty.name if challenge.difficulty else 'N/A'}")
            print(f"     - Tiene score config: {challenge.score_config is not None}")
            print(f"     - Tiene flag: {challenge.flag is not None}")
        print()
        
        # Test 3: Contar registros
        print(" Paso 6: Contando registros en tablas...")
        counts = {
            "Roles": db.query(Role).count(),
            "Dificultades": db.query(Difficulty).count(),
            "Usuarios": db.query(User).count(),
            "Equipos": db.query(Team).count(),
            "Categorías": db.query(ChallengeCategory).count(),
            "Challenges": db.query(Challenge).count(),
            "Submissions": db.query(Submission).count(),
            "Notificaciones": db.query(Notification).count(),
            "Audit Logs": db.query(AuditLog).count(),
        }
        
        for name, count in counts.items():
            print(f"   {name:20} → {count} registros")
        print()
        
        # Test 4: Probar inserción (opcional, comentado para no modificar DB)
        # print(" Paso 7: Probando inserción...")
        # test_role = Role(name="test_role", description="Role de prueba")
        # db.add(test_role)
        # db.commit()
        # print(f"    Rol creado: {test_role}")
        # db.delete(test_role)
        # db.commit()
        # print(f"    Rol eliminado")
        
        db.close()
        
        print("=" * 70)
        print(" ¡Todos los tests pasaron exitosamente!")
        print("\n Resumen:")
        print(f"   - {len(tables)} modelos importados correctamente")
        print(f"   - Conexión a base de datos funcional")
        print(f"   - Relaciones entre modelos funcionando")
        print(f"   - Total de registros: {sum(counts.values())}")
        
        return True
        
    except ImportError as e:
        print(f"Error de importación: {e}")
        print("\nSolución:")
        print("   pip install sqlalchemy psycopg2-binary")
        return False
        
    except Exception as e:
        print(f"Error: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        print(f"\n{traceback.format_exc()}")
        return False


if __name__ == "__main__":
    success = test_models()
    print()
    sys.exit(0 if success else 1)
