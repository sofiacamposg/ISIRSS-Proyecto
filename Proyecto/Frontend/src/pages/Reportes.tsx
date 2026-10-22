
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
