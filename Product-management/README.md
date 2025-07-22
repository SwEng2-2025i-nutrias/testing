# 🛍️ Product Management Testing Suite - AgroConecta

## 📋 Descripción

Suite de herramientas automatizadas para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre productos en el sistema AgroConecta. Incluye autenticación, generación de datos aleatorios y reportes PDF.

---

## 📦 Requisitos

1. **Python 3.8+**
2. **Servicios Backend Activos**:
   - **AuthenticationService**: `http://localhost:5001`
   - **ProductService**: `http://localhost:5000`
3. **Usuarios de Prueba Configurados**:
   - Agricultor: `agricultor1@gmail.com` / `12345678`

---

## 🚀 Ejecución de Scripts

### ➕ Crear Productos
```bash
python create_products.py
```

### ✏️ Editar Productos
```bash
python edit_products.py
```

### 🗑️ Eliminar Productos
```bash
python delete_products.py
```

---

## 📊 Reportes

- **Ubicación**: `reportes/`
- **Formato**: PDF con estadísticas y detalles de productos procesados.

---

## 🐛 Troubleshooting

- **Error de conexión**: Verifica que los servicios backend estén activos.
- **Credenciales inválidas**: Confirma los datos en `LOGIN_CREDENTIALS`.
- **Lista vacía**: Asegúrate de que existan productos asociados al usuario.

---

**Última actualización**: Julio 2025
