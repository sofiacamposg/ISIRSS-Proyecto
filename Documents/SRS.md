# ISIRSS-Proyecto
Integración de Seguridad Informática en Redes y Sistemas de Software, Platataforma de Crecimiento y Desarrollo Saludable del ISSTE

# Equipo
Sofia Campos 
Renata Uruchurtu
Yael Ordaz
David Ortiz

# 1. INTRODUCCIÓN

# 1.1 Propósito

El propósito de este documento es definir los requisitos funcionales y no funcionales para el desarrollo de la plataforma actual del ISSSTE destinada al registro y consulta de información de la población infantil de las Estancias para el Bienestar y Desarrollo Infantil (EBDI).

La plataforma permitirá registrar periódicamente las medidas antropométricas de las niñas y niños, evaluar su crecimiento mediante patrones autorizados, generar gráficas, identificar casos que requieran seguimiento y proporcionar acceso a la información según el perfil de cada usuario.

Este documento servirá como referencia para el diseño, desarrollo, pruebas, validación y aceptación del sistema

# 1.2 Alcance del producto

El proyecto consiste en ampliar la plataforma existente para incorporar los siguientes componentes:

    Padrón infantil centralizado.
    Registro de medidas antropométricas.
    Registro de estatura de los padres.
    Cálculo de indicadores de crecimiento.
    Generación de gráficas.
    Identificación de casos que requieran seguimiento.
    Historia clínica-nutricia.
    Consultas por infante, EBDI, estado y región.
    Acceso para padres, madres o tutores.
    Administración de usuarios y permisos.
    Protección y trazabilidad de información sensible.

La plataforma será utilizada desde computadoras de escritorio y laptops.

La información se almacenará en una base de datos MySQL

# 1.3 Objetivo general

Ampliar la plataforma actual del ISSSTE para facilitar el registro, evaluación, consulta y seguimiento del crecimiento y desarrollo de la población infantil atendida en las EBDI.

# 1.4 Objetivos específicos
Mantener actualizado el padrón infantil de las EBDI.
Registrar mediciones antropométricas cada 45 días.
Calcular automáticamente la edad del infante al momento de cada medición.
Evaluar el crecimiento utilizando patrones autorizados.
Identificar casos que requieran seguimiento.
Permitir consultas según el nivel de acceso del usuario.
Proteger la confidencialidad de los datos de salud de los menores.
Mantener un historial de accesos, registros y correcciones.

# DEFINICIONES Y ABREVIATURAS
| ISSSTE                    | Instituto de Seguridad y Servicios Sociales de los Trabajadores del estado
| EBDI                      | Estancia para el Bienestar y Desarrollo Infantil
| Padrón infantil           | Registro centralizado de los infantes inscritos en las EBDI
| Medición antropométrica   | Medición física, como peso, talla o perímetro cefálico
| IMC                       | Índice de Masa Corporal
| Talla para la edad        | Indicador que compara la talla del infante con la esperada para su edad
| Peso para la talla        | Indicador que relaciona el peso del infante con su talla
| Perímetro cefálico        | Medida de la circunferencia de la cabeza
| Talla diana familiar      | Estimación de la talla esperada basada en la estatura de los padres
| Seguimiento               | Supervisión periódica de un caso que presenta indicadores de atención
| Matrícula                 | Identificador único asignado por la plataforma a cada infante
| Patrón de crecimiento     | Referencia utilizada para comparar las mediciones del infante
| Historia clínica-nutricia | Registro histórico de información relacionada con la salud y nutrición del infante

# 2. DESCRIPCION GENERAL

# 2.1 Usuarios del sistema

Administrador:
    Tendrá acceso completo a la plataforma.
    Sus funciones incluirán:
        Administrar usuarios y permisos.
        Consultar todas las regiones, estados y EBDI.
        Consultar todos los expedientes infantiles.
        Gestionar catálogos.
        Supervisar registros y seguimientos.
        Realizar o autorizar correcciones.
        Consultar la bitácora del sistema.

Usuario de estancia:
    Tendrá acceso exclusivamente a la EBDI que tenga asignada.
    Sus funciones incluirán:
        Consultar a los infantes de su estancia.
        Registrar y actualizar información del padrón.
        Capturar medidas antropométricas.
        Consultar el historial de los infantes.
        Registrar observaciones.
        Consultar alertas y seguimientos.

Coordinador regional:
    Tendrá acceso a los estados y EBDI correspondientes a su región.
    Sus funciones incluirán:
        Consultar información regional.
        Consultar información por estado y EBDI.
        Revisar mediciones pendientes.
        Consultar casos que requieran seguimiento.
        Generar reportes regionales.
# (El ISSSTE deberá confirmar si este usuario podrá modificar información o solamente consultarla.)

Padre, madre o tutor:
    Tendrá acceso exclusivamente a la información del infante que tenga asociado.
    Sus funciones incluirán:
        Consultar mediciones.
        Consultar el historial permitido.
        Consultar avisos de seguimiento.
        Actualizar datos de contacto, si el ISSSTE lo autoriza.

# 2.2 Entorno de operación

La plataforma deberá:
    Funcionar en computadoras de escritorio y laptops.
    Ser accesible mediante un navegador web moderno.
    Adaptarse a diferentes resoluciones de pantalla.
    Integrarse con una base de datos MySQL.
    Funcionar en la infraestructura autorizada por el ISSSTE.

# 2.3 Restricciones
El sistema deberá utilizar MySQL como gestor de base de datos.
La información deberá permanecer bajo propiedad institucional.
El acceso dependerá del perfil y ubicación asignada al usuario.
Los cálculos clínicos deberán utilizar fórmulas y tablas autorizadas por el ISSSTE.
La plataforma no deberá emitir diagnósticos médicos automáticos.
El sistema deberá proteger la información personal y de salud de los menores.
Cada EBDI deberá estar asociada con un estado y una región.
Dependiendo la región se modificarán los parámetro clínicos

# 2.5 Suposiciones y dependencias
El ISSSTE proporcionará la información institucional, los datos disponibles y las especificaciones necesarias para diseñar la base de datos del sistema.
El ISSSTE proporcionará las tablas de crecimiento autorizadas.
El personal médico validará las fórmulas y categorías nutricionales.
Cada infante tendrá una matrícula única.
Cada EBDI estará asociada con un estado y una región.
Cada usuario tendrá credenciales individuales.
La institución definirá los datos que integrarán la historia clínica-nutricia.

# 3. REQUISITOS FUNCIONALES

# 3.1 Padrón infantil

RF-01. Registrar infante
    El sistema deberá permitir que un usuario autorizado registre un nuevo infante en el padrón infantil.

    Como mínimo se deberá almacenar:
        Matrícula.
        Nombre completo.
        Fecha de nacimiento.
        Sexo requerido para aplicar el patrón de crecimiento.
        EBDI.
        Estado.
        Región.
        Fecha de ingreso.
        Seguimiento (activo/ no activo)
        Estado de registro (activo / no activo)
        Datos del padre, madre o tutor.
        Restricciones nutricionales


RF-02. Consultar infante
    El sistema deberá permitir la búsqueda de un infante mediante su matrícula y los demás criterios autorizados.

RF-03. Actualizar información
    El sistema deberá permitir que los usuarios autorizados actualicen la información del infante.

RF-04. Transferir infante
    El sistema deberá permitir registrar el cambio de un infante de una EBDI a otra, conservando su historial.

RF-05. Actualizar padrón mensualmente
    El sistema deberá permitir que cada EBDI revise y actualice mensualmente su padrón infantil.

# 3.2 Información de los padres

RF-06. Registrar estatura de los padres
    El sistema deberá permitir registrar la estatura de la madre y del padre en centímetros con precisión de 1 decimal.

RF-07. Calcular talla diana familiar
    El sistema deberá calcular la talla diana familiar utilizando la fórmula autorizada por el ISSSTE.

# (La fórmula y sus criterios de interpretación quedan pendientes de validación)

# 3.3 Mediciones antropométricas

RF-08. Registrar medición
    El sistema deberá permitir registrar:
        Fecha de medición.
        Peso en kilogramos.
        Talla o longitud en centímetros.
        Perímetro cefálico en centímetros.
        Observaciones.
        Estado nutricional

RF-09. Calcular edad
    El sistema deberá calcular automáticamente la edad exacta del infante en la fecha de medición.

RF-10. Validar mediciones
    El sistema deberá validar que los valores capturados estén dentro de rangos técnicamente permitidos.

RF-11. Registrar mediciones periódicas
    El sistema deberá permitir registrar las mediciones antropométricas de cada infante cada 45 días.

RF-12. Permitir mediciones extraordinarias
    El sistema deberá permitir mediciones adicionales cuando exista una razón de seguimiento, sin eliminar ni sustituir las mediciones anteriores.

RF-13. Conservar historial
    El sistema deberá conservar cronológicamente todas las mediciones registradas para cada infante.

# 3.4 Evaluación del crecimiento

RF-14. Calcular IMC
    El sistema deberá calcular el IMC con base en el peso y la estatura registrados.

RF-15. Evaluar peso para la talla
    El sistema deberá comparar el peso y la talla del infante con el peso y talla de los padres en base a fórmulas predeterminadas y autorizadas, basándose en el patrón del estándar geográfico de los padres.

RF-16. Evaluar talla para la edad
    El sistema deberá comparar la talla del infante con el valor esperado para su edad y el patrón del estándar geográfico de los padres.

RF-17. Evaluar IMC para la edad
    El sistema deberá evaluar el IMC de acuerdo con la edad, el sexo con fórmulas predeterminadas y autorizadas.

RF-18. Evaluar perímetro cefálico
    El sistema deberá comparar el perímetro cefálico con los parámetros autorizados para la edad y sexo del infante.

RF-19. Clasificar el resultado
    El sistema deberá asignar una categoría a cada indicador según los límites autorizados por el ISSSTE.

RF-20. Registrar referencia utilizada
    El sistema deberá guardar la fuente y versión de las tablas utilizadas en cada evaluación.

# 3.6 Alertas y seguimiento

RF-21. Generar alerta
    El sistema deberá generar una alerta cuando un indicador se encuentre fuera de los rangos autorizados.

RF-22 Generar alerta por infantes pendientes de chequeo
    El sistema deberá generar una alerta cuando no se ha registrado un chequeo en más de 45 días

RF-23. Registrar problema de salud
    El sistema deberá permitir que el usuario autorizado registre una condición de salud que requiera seguimiento.

RF-24. Marcar caso para seguimiento
    El sistema deberá permitir marcar a un infante como “Requiere seguimiento”.

RF-25. Administrar estado de seguimiento
    El sistema deberá manejar, como mínimo, los siguientes estados:
        Sin seguimiento.
        Requiere seguimiento.
        En seguimiento.
        Seguimiento concluido.

RF-26. Registrar acciones de seguimiento
    El sistema deberá permitir registrar en casos de seguimiento activo como mínimo:
        Observaciones
        Acciones realizadas
        Responsable
# (Responsable de seguimiento quien es?coordinar regional? preguntar en siguiente junta conn socio-formador, en caso de que sea un actor experno, médicos etc, en la parte de RF-01 debe )
        Fecha de seguimiento.

RF-27. Mostrar casos en seguimiento
    El sistema deberá mostrar los casos en seguimiento según el nivel de acceso del usuario.

# 3.7 Regionalización

RF-28. Administrar regiones
    El sistema deberá permitir al administrador configurar las regiones autorizadas.

RF-29. Asociar estados con regiones
    El sistema deberá permitir asociar cada estado con una región.

RF-30. Asociar EBDI
    El sistema deberá permitir asociar cada EBDI con un estado y una región.

RF-31. Consultar por región
    El sistema deberá permitir consultas consolidadas por región, estado y EBDI a usuarios autorizados.

# 3.8 Acceso de padres

RF-32. Asociar tutor con infante
    El sistema deberá permitir asociar un padre, madre o tutor con uno o más infantes.

RF-33. Restringir acceso
    El padre, madre o tutor solamente podrá consultar información de los infantes asociados con su cuenta.

RF-34. Consultar resultados
    El padre, madre o tutor podrá consultar las mediciones, gráficas y mensajes autorizados.

RF-35. Proteger la matrícula
    La matrícula deberá utilizarse como identificador, pero no deberá ser el único mecanismo de autenticación

# 3.9 Administración y auditoría

RF-36. Gestionar usuarios
    El administrador deberá poder crear, modificar, bloquear, eliminar y asignar perfiles a los usuarios.

RF-37. Asignar ámbito de acceso
    El sistema deberá permitir asociar usuarios con una EBDI, estado o región.

RF-38. Registrar bitácora
    El sistema deberá registrar:
        Usuario.
        Fecha y hora.
        Acción realizada.
        Registro afectado.
        Valor anterior.
        Valor nuevo.

RF-39. Corregir medición
    El sistema deberá permitir corregir una medición sin eliminar el registro original.

RF-40. Generar reportes
    El sistema deberá generar reportes por:
        Infante.
        EBDI.
        Estado.
        Región.
        Periodo.
        Categoría de edad.
        Estado de seguimiento.

# 3.10 Accesibilidad
# (Aquí escribir todos los requisitos relacionados con accesibildiad)

# REQUISITOS NO FUNCIONALES
# (falta ser más específicos en algunos pero necesitamos validar información con el socio-formador)
RNF-01. Seguridad
    El sistema deberá exigir autenticación para acceder a información personal o clínica.

RNF-02. Autorización
    El sistema deberá verificar los permisos del usuario antes de mostrar, registrar o modificar información.

RNF-03. Confidencialidad
    La información personal y de salud deberá ser accesible únicamente para usuarios autorizados.

RNF-04. Cifrado
    Las comunicaciones entre el navegador y el servidor deberán utilizar conexiones cifradas.

RNF-05. Trazabilidad
    Toda creación, modificación, corrección o cambio de seguimiento deberá quedar registrado en una bitácora.

RNF-06. Integridad
    El sistema deberá evitar modificaciones no autorizadas y conservar el historial de los registros.

RNF-07. Disponibilidad
    La disponibilidad requerida será de [POR DEFINIR]%, dentro del horario establecido por el ISSSTE.

RNF-08. Rendimiento
    Las consultas ordinarias deberán mostrar resultados en un máximo de [POR DEFINIR] segundos bajo la carga esperada.

RNF-09. Compatibilidad
    La plataforma deberá funcionar en las versiones autorizadas de Chrome, Edge y Firefox.

RNF-10. Usabilidad
    La captura de una medición deberá poder completarse mediante un flujo sencillo y con mensajes claros de validación.

RNF-11. Accesibilidad
    La interfaz deberá cumplir con el nivel de accesibilidad definido por el ISSSTE.

RNF-12. Respaldo
    La base de datos deberá respaldarse con la frecuencia y política institucional autorizadas.

RNF-13. Recuperación
    El sistema deberá contar con un procedimiento para recuperar la información en caso de falla.

RNF-14. Escalabilidad
    La plataforma deberá soportar el crecimiento del número de infantes, EBDI, mediciones y usuarios sin requerir un rediseño completo.

RNF-15. Mantenibilidad
    Las nuevas funcionalidades deberán utilizar una estructura modular, documentación técnica y control de versiones.

# 6. INTERFACES EXTERNAS

# 6.1 Interfaz de usuario

La aplicación será utilizada desde un navegador web en laptops y computadoras de escritorio.

Deberá contar con interfaces para:

    Inicio de sesión.
    Panel principal.
    Padrón infantil.
    Expediente individual.
    Registro de mediciones.
    Seguimiento.
    Consultas y reportes.
    Administración de usuarios.
    Portal para padres.

# 6.2 Interfaz con la base de datos

Las nuevas funcionalidades deberán almacenar y consultar la información mediante MySQL, utilizando una estructura aprobada por el ISSTE.

# 6.3 Interfaces con otros sistemas

Se deberá determinar si la plataforma necesita conectarse con:
    Sistemas institucionales del ISSSTE.
    Servicios de identificación.
    Sistemas de expedientes clínicos.
    Servicios de correo electrónico.
    Plataformas de notificaciones.
    Herramientas de reportes.