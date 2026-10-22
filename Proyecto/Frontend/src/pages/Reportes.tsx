import { useMemo, useState } from "react";
import { useGetList } from "react-admin";
import { Box, Card, CardContent, Typography, Grid, TextField, MenuItem, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, CircularProgress,} from "@mui/material";

// Datos que utilizan los reportes.
type Infante = {
  id: number;
  nombre: string;
  ultimaMedicion?: string;
  diasDesdeUltimaMedicion?: number | null;
  estadoSeguimiento?: string;
};

type Medicion = {
  id: number;
  infanteId: number;
  fecha: string;
  pesoKg: number;
  tallaCm: number;
  perimetroCefalicoCm?: number;
  observaciones?: string;
};

type Seguimiento = {
  id: number;
  infanteId: number;
  fecha: string;
  motivo: string;
  responsable: string;
  estado: string;
};

// Comprueba si la fecha está dentro del periodo seleccionado.
function fechaDentroDelRango(
  fecha: string,
  desde: string,
  hasta: string
) {
  if (desde && fecha < desde) return false;
  if (hasta && fecha > hasta) return false;
  return true;
}

// Crea y descarga un archivo CSV con los registros filtrados.
function exportarCSV(
  nombreArchivo: string,
  encabezados: string[],
  filas: (string | number)[][]
) {
  const escapar = (valor: string | number) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const contenido = [
    encabezados.map(escapar).join(","),
    ...filas.map((fila) => fila.map(escapar).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF" + contenido], {type: "text/csv;charset=utf-8;",});
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Tarjeta reutilizable para mostrar una cantidad y su descripción.
function TarjetaResumen({titulo, valor,descripcion,}: {
  titulo: string;
  valor: number;
  descripcion: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {titulo}
        </Typography>
        <Typography variant="h4" sx={{ my: 1 }}>
          {valor}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {descripcion}
        </Typography>
      </CardContent>
    </Card>
  );
}
// Las fechas se guardan en formato ISO; solo cambiamos cómo se muestran.
function formatearFecha(fecha: string) {
  if (!fecha) return "—";
  const [anio, mes, dia] = fecha.slice(0, 10).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : fecha;
}

// Página principal de reportes.
export const ReportesPage = () => {
  // Filtros elegidos por el usuario.
  const [infanteSeleccionado, setInfanteSeleccionado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  // Obtiene los datos necesarios desde React Admin.
  const {
    data: infantes = [],
    isPending: cargandoInfantes,
    error: errorInfantes,
  } = useGetList<Infante>("infantes", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "nombre", order: "ASC" },
  });
  const {
    data: mediciones = [],
    isPending: cargandoMediciones,
    error: errorMediciones,
  } = useGetList<Medicion>("mediciones", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "fecha", order: "DESC" },
  });
  const {
    data: seguimientos = [],
    isPending: cargandoSeguimientos,
    error: errorSeguimientos,
  } = useGetList<Seguimiento>("seguimientos", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "fecha", order: "DESC" },
  });
  // Impide exportar si la fecha inicial supera a la final.
  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);
  const cargando = cargandoInfantes || cargandoMediciones || cargandoSeguimientos;
  const error = errorInfantes || errorMediciones || errorSeguimientos;
  // Aplica los filtros de infante y fechas a las mediciones.
  const medicionesFiltradas = useMemo(() => {
    return mediciones.filter((medicion) => {
      const coincideInfante = infanteSeleccionado === "" || String(medicion.infanteId) === infanteSeleccionado;
      return (
        coincideInfante &&
        fechaDentroDelRango(medicion.fecha, fechaDesde, fechaHasta)
      );
    });
  }, [mediciones, infanteSeleccionado, fechaDesde, fechaHasta]);
  // Aplica los mismos filtros a los seguimientos.
  const seguimientosFiltrados = useMemo(() => {
    return seguimientos.filter((seguimiento) => {
      const coincideInfante = infanteSeleccionado === "" || String(seguimiento.infanteId) === infanteSeleccionado;
      return (
        coincideInfante &&
        fechaDentroDelRango(seguimiento.fecha, fechaDesde, fechaHasta)
      );
    });
  }, [seguimientos, infanteSeleccionado, fechaDesde, fechaHasta]);

  // Calcula los números que aparecen en las tarjetas.
  const infantesConMediciones = useMemo(() => {
    const ids = new Set(mediciones.map((medicion) => medicion.infanteId));
    return ids.size;
  }, [mediciones]);

  const alertasPendientes = useMemo(() => {
    return infantes.filter((infante) => infante.estadoSeguimiento !== "Al día").length;
  }, [infantes]);

  // Cuenta los seguimientos según su estado.
  const conteoEstados = useMemo(() => {
    return seguimientosFiltrados.reduce<Record<string, number>>(
      (conteo, seguimiento) => {
        conteo[seguimiento.estado] = (conteo[seguimiento.estado] || 0) + 1;
        return conteo;
      },
      {}
    );
  }, [seguimientosFiltrados]);

  const nombreInfante = (id: number) => infantes.find((infante) => infante.id === id)?.nombre ?? `Infante ${id}`;
  // Restablece todos los filtros.
  const limpiarFiltros = () => {
    setInfanteSeleccionado("");
    setFechaDesde("");
    setFechaHasta("");
  };
  // Muestra mensajes mientras se obtienen los datos o si ocurre un error.
  if (cargando) {
    return (
      <Box sx={{ p: 4, display: "flex", gap: 2 }}>
        <CircularProgress aria-label="Cargando reporte" />
        <Typography>Cargando reportes...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          No fue posible cargar los reportes. Verifica el dataProvider.
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Reportes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Resumen de infantes, mediciones y seguimientos registrados.
      </Typography>
      {/* Tarjetas con las cifras generales. */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TarjetaResumen titulo="Infantes registrados" valor={infantes.length} descripcion="Total de expedientes" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TarjetaResumen titulo="Con mediciones" valor={infantesConMediciones} descripcion="Infantes con al menos un registro" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TarjetaResumen titulo="Mediciones registradas" valor={mediciones.length} descripcion="Total histórico" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TarjetaResumen titulo="Infantes con alertas" valor={alertasPendientes} descripcion="Sin mediciones o con medición pendiente" />
        </Grid>
      </Grid>
      {/* Filtros de búsqueda y selección de fechas. */}
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Filtros del reporte
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField select fullWidth label="Infante" value={infanteSeleccionado} onChange={(event) => setInfanteSeleccionado(event.target.value)} >
            <MenuItem value="">Todos los infantes</MenuItem>
            {infantes.map((infante) => (
              <MenuItem key={infante.id} value={String(infante.id)}>
                {infante.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth type="date" label="Desde" value={fechaDesde} onChange={(event) => setFechaDesde(event.target.value)} error={rangoInvalido} helperText={rangoInvalido ? "Revisa el rango de fechas" : undefined} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth type="date" label="Hasta" value={fechaHasta} onChange={(event) => setFechaHasta(event.target.value)} error={rangoInvalido} helperText={rangoInvalido ? "Revisa el rango de fechas" : undefined} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button fullWidth variant="outlined" onClick={limpiarFiltros} sx={{ minHeight: 48 }} >
            Limpiar
          </Button>
        </Grid>
      </Grid>
      {/* El lector de pantalla anuncia el error del rango de fechas. */}
      {rangoInvalido && (
        <Typography id="error-fechas-reporte" role="alert" color="error" sx={{ mb: 2 }}>
          La fecha inicial no puede ser posterior a la fecha final.
        </Typography>
      )}
      {/* Exporta únicamente los registros que cumplen los filtros. */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 4 }}>
        <Button variant="contained" disabled={rangoInvalido}
          aria-describedby={rangoInvalido ? "error-fechas-reporte" : undefined}
          onClick={() => exportarCSV(
              "reporte_mediciones.csv",
              [
                "Infante",
                "Fecha",
                "Peso (kg)",
                "Talla (cm)",
                "Perímetro cefálico (cm)",
                "Observaciones",
              ],
              medicionesFiltradas.map((medicion) => [
                nombreInfante(medicion.infanteId),
                medicion.fecha,
                medicion.pesoKg,
                medicion.tallaCm,
                medicion.perimetroCefalicoCm ?? "",
                medicion.observaciones ?? "",
              ])
            )
          }
        >
          Exportar mediciones CSV
        </Button>
        <Button variant="outlined" disabled={rangoInvalido}
          aria-describedby={rangoInvalido ? "error-fechas-reporte" : undefined}
          onClick={() => exportarCSV(
              "reporte_seguimientos.csv",
              [
                "Infante",
                "Fecha",
                "Motivo",
                "Responsable",
                "Estado",
              ],
              seguimientosFiltrados.map((seguimiento) => [
                nombreInfante(seguimiento.infanteId),
                seguimiento.fecha,
                seguimiento.motivo,
                seguimiento.responsable,
                seguimiento.estado,
              ])
            )
          }
        >
          Exportar seguimientos CSV
        </Button>
      </Box>
      {/* Resumen de casos agrupados por estado. */}
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Resumen de seguimientos
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          "Sin seguimiento",
          "Requiere seguimiento",
          "En seguimiento",
          "Seguimiento concluido",
        ].map((estado) => (
          <Grid key={estado} size={{ xs: 12, sm: 6, md: 3 }}>
            <TarjetaResumen
              titulo={estado}
              valor={conteoEstados[estado] || 0}
              descripcion="Casos en el filtro actual"
            />
          </Grid>
        ))}
      </Grid>
      {/* Tablas de resultados; las fechas solo se formatean al mostrarse. */}
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Mediciones ({medicionesFiltradas.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Infante</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Peso (kg)</TableCell>
              <TableCell align="right">Talla (cm)</TableCell>
              <TableCell align="right">Perímetro cefálico (cm)</TableCell>
              <TableCell>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicionesFiltradas.map((medicion) => (
              <TableRow key={medicion.id}>
                <TableCell>{nombreInfante(medicion.infanteId)}</TableCell>
                <TableCell>{formatearFecha(medicion.fecha)}</TableCell>
                <TableCell align="right">{medicion.pesoKg}</TableCell>
                <TableCell align="right">{medicion.tallaCm}</TableCell>
                <TableCell align="right">{medicion.perimetroCefalicoCm ?? "—"}</TableCell>
                <TableCell>{medicion.observaciones || "—"}</TableCell>
              </TableRow>
            ))}
            {medicionesFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay mediciones para los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Seguimientos ({seguimientosFiltrados.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Infante</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seguimientosFiltrados.map((seguimiento) => (
              <TableRow key={seguimiento.id}>
                <TableCell>{nombreInfante(seguimiento.infanteId)}</TableCell>
                <TableCell>{formatearFecha(seguimiento.fecha)}</TableCell>
                <TableCell>{seguimiento.motivo}</TableCell>
                <TableCell>{seguimiento.responsable}</TableCell>
                <TableCell>{seguimiento.estado}</TableCell>
              </TableRow>
            ))}

            {seguimientosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay seguimientos para los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};