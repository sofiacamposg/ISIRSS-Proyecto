# Manual de usuario

**Plataforma de Crecimiento y Desarrollo Saludable**

Padrón Infantil de las Estancias para el Bienestar y Desarrollo Infantil (EBDI)

## 1. Introducción

La Plataforma de Crecimiento y Desarrollo Saludable permite registrar y consultar el crecimiento de los infantes inscritos en las EBDI. Con ella se pueden:
 
- Mantener el padrón de infantes y sus tutores.
- Registrar mediciones de peso, talla y perímetro cefálico.
- Consultar gráficas de crecimiento.
- Dar seguimiento nutricional a los casos que lo requieran.
- Generar reportes y exportarlos en CSV.

Lo que cada persona puede ver y hacer depende de su rol asignado. Las opciones que no le corresponden a un rol no aparecen en su menú.

--- 

## 2. Roles del sistema

**Administrador:** Responsable de la operación general del sistema. Tiene acceso a toda la información y a todos los módulos.

**Personal de EBDI:** Personal de una estancia que captura los datos. Solo ve y registra los infantes de la EBDI asignada a su cuenta.

**Coordinador regional:** Supervisa las EBDI de una región. Solo consulta (lectura) la información de la región asignada a su cuenta.

**Tutor:** Padre, madre o tutor de un infante. Solo consulta los infantes cuyo acceso fue autorizado.

---

## 3. Registro de usuarios
 
Las cuentas solo las puede crear el Administrador, para que únicamente el personal autorizado y los tutores verificados tengan acceso.

### 3.1 Registrar un usuario (Administrador)
 
1. En el menú lateral, sección **Gestión**, entra a **Usuarios**.
2. Selecciona **Crear**.
3. Llena el formulario **Registrar usuario**:
    - **Nombre completo** (obligatorio): máximo 150 caracteres.
    - **Correo electrónico** (obligatorio): será el usuario para iniciar sesión. No puede repetirse.
    - **Contraseña** (obligatoria): contraseña inicial de la cuenta. Se guarda cifrada.
    - **Rol del usuario** (obligatorio): Administrador, Coordinador regional, Personal de EBDI o Tutor.
    - **Estado de la cuenta** (obligatorio): Por defecto es Activo.
    - **EBDI asignada** (obligatoria solo para Personal de EBDI): aparece al elegir ese rol y define qué infantes podrá ver y capturar.
    - **Región asignada** (obligatoria solo para Coordinador regional): aparece al elegir ese rol y define de qué región podrá consultar la información.
    - **Teléfono del tutor** (opcional, solo para Tutor): aparece al elegir el rol Tutor. Exactamente 10 dígitos, por ejemplo 5512345678.
4. Selecciona **Guardar**.
5. Comparte el correo y la contraseña inicial con la persona por un medio seguro.

### 3.2 Editar o dar de baja un usuario
 
1. En **Usuarios**, abre el usuario de la lista.
2. En **Editar usuario** puedes cambiar el nombre, el correo, el rol, la EBDI o región asignada y el estado de la cuenta.
3. **Nueva contraseña (opcional):** déjala vacía para conservar la contraseña actual.
4. Para impedir el acceso sin borrar la cuenta, cambia el **Estado de la cuenta** a **Bloqueado** o **Baja**.

### 3.3 Dar acceso a un tutor
1. Registra al tutor en **Tutores** o créale una cuenta con rol Tutor. Si el correo coincide, ambos registros se vinculan solos.
2. Al registrar o editar al infante, elige su **Padre, madre o tutor** y el **Parentesco**.
3. En **Autorizaciones de tutores**, selecciona **Autorizar acceso**.

---

## 4. Autenticación
 
### Iniciar sesión
1. Escribe tu **Correo electrónico** y **Contraseña**. El botón del ojo muestra u oculta la contraseña.
2. Selecciona **Ingresar**.

### Mensajes de error
- "Credenciales incorrectas": el correo o la contraseña no coinciden. Si la olvidaste, pide una nueva al Administrador.
- "La cuenta no está activa": la cuenta está bloqueada o dada de baja.
- "No se pudo conectar con el servidor": intenta más tarde.

### Sesión
- Dura **8 horas** y se borra al cerrar el navegador.
- Para salir, abre el ícono de usuario (arriba a la derecha) y selecciona **Cerrar sesión**.
- Todos los intentos de inicio de sesión quedan registrados en la bitácora.

---
 
## 5. Uso general
 
- Menú lateral: opciones según tu rol. La página actual aparece resaltada. El botón de la barra superior lo abre o lo cierra.
- Listas: usa los filtros de arriba, ordena con el título de cada columna, **Ver** abre el detalle y **Exportar** descarga en CSV.
- Formularios: los campos con asterisco son obligatorios. Si falta algo, aparece un mensaje en rojo debajo del campo.
- Pie de página: Aviso de privacidad, Preguntas frecuentes, Ayuda y botón para **Volver arriba**.

---
 
## 6. Administrador

Tiene acceso a todo.

- **Inicio:** totales, accesos rápidos e infantes recientes.
- **Infantes:** consulta, registra y edita. La ficha muestra el historial de crecimiento.
- **Mediciones:** registra peso, talla y perímetro cefálico. Para corregir, selecciona **Editar** y escribe el motivo; la medición original se conserva como versión anterior.
- **Condiciones de salud:** registra condiciones relevantes de un infante.
- **Seguimiento nutricional:** abre, actualiza y cierra casos.
- **Acciones a seguimientos:** registra las acciones realizadas en cada caso.
- **Gráficas de crecimiento:** muestra la evolución de peso, talla y perímetro cefálico, con una tabla de historial e IMC.
- **Alertas:** consulta avisos de crecimiento y mediciones pendientes.
- **Reportes:** filtra por infante y fechas, y exporta a CSV.
- **Tutores:** consulta y registra tutores.
- **Usuarios y Autorizaciones de tutores:** ver la sección 3.
- **Catálogos:** consulta Regiones, Estados y EBDI.
 
## 7. Personal de EBDI

Trabaja solo con la información de su EBDI.

- **Inicio:** totales de su EBDI y accesos rápidos.
- **Infantes:** consulta, registra y edita. Los infantes que registra quedan asignados a su EBDI.
- **Mediciones:** registra y corrige, escribiendo siempre el motivo de la corrección.
- **Seguimiento nutricional:** abre, actualiza y cierra casos.
- **Acciones a seguimientos:** registra las acciones realizadas en cada caso.
- **Gráficas de crecimiento:** consulta la evolución de sus infantes.
- **Alertas:** consulta avisos de crecimiento y mediciones pendientes.
- **Tutores:** consulta la lista para relacionar un tutor con un infante.

## 8. Coordinador regional

Solo consulta la información de su región. No puede registrar ni editar.

- **Inicio:** totales y accesos rápidos.
- **Infantes y Mediciones:** consulta la lista y el detalle.
- **Seguimiento nutricional:** consulta los casos y su estado.
- **Gráficas de crecimiento:** consulta la evolución de cada infante.
- **Alertas:** consulta avisos de crecimiento y mediciones pendientes.
- **Reportes:** filtra por infante y fechas, y exporta a CSV.
- **Tutores:** consulta la lista.
- **Catálogos:** consulta los Estados y las EBDI de su región.

## 9. Tutor

Solo consulta la información de sus infantes autorizados.

- **Inicio:** acceso rápido a **Ver mis infantes** y a las gráficas.
- **Infantes:** consulta la ficha y el historial de crecimiento.
- **Mediciones:** consulta cada registro.
- **Gráficas de crecimiento:** consulta la evolución de peso, talla y perímetro cefálico.

Si no aparece un infante, el acceso puede estar pendiente de autorización.
 
---
 
## 10. Accesibilidad
 
- Todo se puede usar con teclado (Tab, Enter, Espacio).
- Al cambiar de página, el foco va al título principal.
- Las gráficas tienen un resumen en texto para lectores de pantalla.

---
