# 🔐 Control de Acceso Basado en Roles (RBAC)

## ✅ Cambios Implementados en Backend

### **1. Token JWT con Rol**

Ahora el token JWT incluye el rol del usuario:

**Antes:**
```json
{
  "sub": 1,
  "username": "admin",
  "role_id": 1,
  "exp": 1733209856
}
```

**Después:**
```json
{
  "sub": 1,
  "username": "admin",
  "role": "admin",  // ← Nombre del rol directamente
  "exp": 1733209856
}
```

**Archivo modificado:** `app/services/auth_service.py`

---

### **2. Dependencies Mejoradas**

**`app/api/deps.py`** ahora incluye:

#### **`get_current_user()`**
Obtiene el usuario autenticado del token JWT (sin verificar rol).

#### **`get_current_admin()`**
Verifica que el usuario sea **admin**. Lanza 403 Forbidden si no lo es.

**Uso:**
```python
@router.get("/admin/users")
async def list_users(
    current_user: User = Depends(get_current_admin)  # ← Solo admin
):
    ...
```

#### **`get_current_moderator_or_admin()`**
Verifica que el usuario sea **moderator** o **admin**.

**Uso:**
```python
@router.get("/moderate/challenges")
async def moderate(
    current_user: User = Depends(get_current_moderator_or_admin)
):
    ...
```

#### **`require_role(allowed_roles: list)`**
Dependency personalizada para múltiples roles.

**Uso:**
```python
@router.get("/special", dependencies=[Depends(require_role(["admin", "moderator"]))])
async def special_endpoint():
    ...
```

---

### **3. Router de Admin**

**Nuevo archivo:** `app/api/v1/admin.py`

Endpoints exclusivos para administradores:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/admin/users` | GET | Listar todos los usuarios |
| `/api/v1/admin/users/{id}` | DELETE | Eliminar un usuario |
| `/api/v1/admin/statistics` | GET | Ver estadísticas de la plataforma |

Todos requieren rol **admin** (verificado con `Depends(get_current_admin)`).

---

## 🧪 Cómo Probar

### **Opción 1: Script de Prueba**

```bash
cd backend
python tests/test_roles.py
```

Verifica que:
- ✅ Tokens incluyen el campo `role`
- ✅ Usuarios tienen los roles correctos
- ✅ Admin, moderator y user se diferencian

---

### **Opción 2: Swagger UI**

1. Levantar el backend:
```bash
docker-compose up backend
```

2. Abrir: http://localhost:8000/docs

3. **Login como admin:**
   - POST `/api/v1/auth/login`
   - Body: `{"username": "admin", "password": "admin123"}`
   - Copiar el `access_token`

4. **Autorizar:**
   - Click en el botón "Authorize" (arriba derecha)
   - Pegar: `<access_token>` (sin "Bearer")
   - Click "Authorize"

5. **Probar endpoint de admin:**
   - GET `/api/v1/admin/users`
   - Click "Try it out" → "Execute"
   - **Resultado esperado:** 200 OK con lista de usuarios

6. **Login como usuario normal:**
   - POST `/api/v1/auth/login`
   - Body: `{"username": "alice", "password": "password123"}`
   - Copiar nuevo token y autorizar

7. **Probar endpoint de admin de nuevo:**
   - GET `/api/v1/admin/users`
   - **Resultado esperado:** 403 Forbidden
   ```json
   {
     "detail": "Not enough permissions. Admin role required."
   }
   ```

---

### **Opción 3: curl**

```bash
# Login como admin
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Respuesta:
# {"access_token":"eyJ...","token_type":"bearer"}

# Guardar token
TOKEN="eyJ..."

# Acceder a endpoint de admin (✅ funciona)
curl http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Acceder con usuario normal (❌ falla con 403)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'

USER_TOKEN="eyJ..."

curl http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer $USER_TOKEN"

# Respuesta:
# {"detail":"Not enough permissions. Admin role required."}
```

---

## 📊 Roles Disponibles

| Rol | Permisos | Usuarios de Prueba |
|-----|----------|-------------------|
| **admin** | Acceso total (users, challenges, teams, config) | `admin` (password: `admin123`) |
| **moderator** | Gestión de challenges y submissions | `moderator` (password: `password123`) |
| **user** | Ver challenges, enviar submissions, unirse a teams | `alice`, `bob`, `charlie`, etc. (password: `password123`) |

---

## 🔒 Ejemplo de Uso en Código

### **Endpoint solo para admin:**
```python
from app.api.deps import get_current_admin

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),  # ← Verifica admin
    db: Session = Depends(get_db)
):
    # Solo llega aquí si current_user es admin
    user = db.query(User).filter(User.id == user_id).first()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
```

### **Endpoint para moderator o admin:**
```python
from app.api.deps import get_current_moderator_or_admin

@router.post("/challenges")
async def create_challenge(
    challenge_data: ChallengeCreate,
    current_user: User = Depends(get_current_moderator_or_admin),
    db: Session = Depends(get_db)
):
    # Moderators y admins pueden crear challenges
    challenge = Challenge(**challenge_data.dict())
    db.add(challenge)
    db.commit()
    return challenge
```

### **Endpoint para múltiples roles específicos:**
```python
from app.api.deps import require_role

@router.get("/reports", dependencies=[Depends(require_role(["admin", "moderator"]))])
async def get_reports(db: Session = Depends(get_db)):
    # Solo admin y moderator
    return {"reports": [...]}
```

---

## ✅ Próximos Pasos

1. ✅ **Backend completado** - Control de roles implementado
2. ⏭️ **Frontend** - Implementar rutas protegidas en React
3. ⏭️ **Testing** - Probar endpoints con diferentes roles
4. ⏭️ **Más endpoints** - Crear routers para challenges, teams, submissions

---

## 🐛 Troubleshooting

### Error: "Not enough permissions"
- ✅ Verifica que el token sea del usuario correcto
- ✅ Verifica el rol en la DB: `SELECT u.username, r.name FROM "user" u JOIN role r ON u.role_id = r.id;`

### Error: "Could not validate credentials"
- ✅ Token expiró (dura 24 horas)
- ✅ Hacer login nuevamente

### Error: 404 Not Found en `/api/v1/admin/users`
- ✅ Verifica que el backend esté corriendo
- ✅ Verifica que el router de admin esté incluido en `router.py`
