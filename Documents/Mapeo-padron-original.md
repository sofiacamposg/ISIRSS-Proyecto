# Inventario del padrón original

117 columnas; 72 campos mensuales. Este inventario no ejecuta una migración. Todas las columnas se conservan en el origen; staging y transformaciones quedan pendientes de aprobación.

| Columna original | Destino propuesto | Condición |
|---|---|---|
| `id_infante` | infantes.id_infante_origen | Conservar ID original; PK nueva independiente. |
| `id_benef_infante` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `matricula` | infantes.matricula | Convertir a texto tras conciliar ceros/duplicados; preservar valor original. |
| `ur` | Pendiente; conservar en staging | No asumir región. |
| `ebdi` | infantes.id_ebdi vía ebdi.clave | Requiere catálogo y correspondencia de claves. |
| `nombre` | infantes.nombre | Validar codificación y longitud. |
| `paterno` | infantes.apellido_paterno | Validar vacío/NULL. |
| `materno` | infantes.apellido_materno | Validar vacío/NULL. |
| `genero` | infantes.sexo_patron (condicional) | Mapeo institucional autorizado; no inferir. |
| `curp` | infantes.curp | Vacío a NULL solo por regla aprobada; revisar duplicados. |
| `fnac` | infantes.fecha_nacimiento | Validar fechas cero/inválidas. |
| `freg` | infantes.fecha_ingreso (condicional) | Confirmar significado; no asumir fecha de ingreso. |
| `estatus_servicio` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `estrato` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fmovimiento` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `movimiento` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `movSiguiente` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fsistema` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `activo` | infantes.activo (condicional) | Conciliar con baja y estatus_servicio. |
| `puede_editar` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `idAnt` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `idPos` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `estratoAnt` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `estratoPos` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fCambioEst_ini` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fCambioEst_fin` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `ebdiAnt` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `ebdiPos` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fCambioEbdi_ini` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fCambioEbdi_fin` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `baja` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fBaja` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `motivoBaja` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `fCambio` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `movimPrevio` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `discapacidad` | Pendiente; conservar en staging | No convertir automáticamente en diagnóstico/seguimiento. |
| `grupoDisc` | Pendiente; conservar en staging | Requiere catálogo institucional y política de privacidad. |
| `dif_cvrp` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `dif_cvfn` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `dif_pat` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `dif_mat` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `inscripcionInicial` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `comentario` | Pendiente; conservar en staging | Solicitar significado/catálogo/regla antes de transformar; no descartar. |
| `inscIniOct` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIni10` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIni11` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniSep21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `usuario` | Pendiente; conservar en staging | No atribuir acciones a nuevas cuentas por coincidencia de texto. |
| `inscripIni12` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniEne21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniFeb21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniMarzo21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniAbril21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniMayo21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniJunio21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniJulio21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniAgos21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniOct21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscripIniNov21` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniDic2021` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniEne2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniFeb2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniMarzo2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniAbril2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniMayo2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `RegPesoTalla` | Pendiente; conservar en staging | Entero sin semántica: no es peso/talla ni historial. |
| `inscIniJunio2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniJulio2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniAgosto2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniSep2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniOct2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniNov2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniDic2022` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniEne2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniFeb2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniMar2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniAbr2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniMay2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniJun2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniJul2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniAgo2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniSep2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniOct2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniNov2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniDic2023` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniEne2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniFeb2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniMar2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniAbr2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniMay2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniJun2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniJul2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniAgo2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniSep2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniOct2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `inscIniNov2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniDic2024` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniEne2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniFeb2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniMar2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniAbr2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniMay2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniJun2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniJul2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniAgo2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniSep2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniOct2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniNov2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniDic2025` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniEne2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniFeb2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniMar2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniAbr2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniMay2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniJun2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniJul2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
| `InscIniAgo2026` | inscripciones_mensuales (condicional) | Despivotar a filas; confirmar periodo exacto y significado del código; conservar columna original en staging. |
