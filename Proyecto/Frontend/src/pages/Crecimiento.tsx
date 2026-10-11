import { useState } from "react";
import { useGetList } from "react-admin";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,} from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, } from "recharts";

type Infante = {
  id: number;
  nombre: string;
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

export function CrecimientoPage() {
  const [infanteId, setInfanteId] = useState<number | "">("");
  const {
    data: infantes = [],
    isPending: cargandoInfantes,
    error: errorInfantes,
  } = useGetList<Infante>("infantes", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "nombre", order: "ASC" },
  });
  const {
    data: mediciones = [],
    isPending: cargandoMediciones,
    error: errorMediciones,
  } = useGetList<Medicion>("mediciones", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "fecha", order: "ASC" },
  });

  if (cargandoInfantes || cargandoMediciones) {
    return <Typography>Cargando información...</Typography>;
  }

  if (errorInfantes || errorMediciones) {
    return (
      <Typography color="error">
        No fue posible cargar los datos de crecimiento.
      </Typography>
    );
  }
  const medicionesInfante = mediciones.filter((m) => String(m.infanteId) === String(infanteId)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const datosGrafica = medicionesInfante.map((m) => ({
    ...m,
    fechaCorta: m.fecha.split("-").reverse().join("/"),
    imc:
      m.tallaCm > 0
        ? m.pesoKg / Math.pow(m.tallaCm / 100, 2)
        : null,
  }));

  function GraficaLinea({
    titulo,
    campo,
    unidad,
  }: {
    titulo: string;
    campo: "pesoKg" | "tallaCm" | "perimetroCefalicoCm";
    unidad: string;
  }) {
    const datos = datosGrafica.filter((m) => m[campo] != null);
    return (
      <Paper sx={{ p: 2, minWidth: 0 }}>
        <Typography variant="h6" gutterBottom>
          {titulo}
        </Typography>
        {datos.length === 0 ? (
          <Typography color="text.secondary">
            No hay mediciones disponibles para esta gráfica.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fechaCorta" />
                <YAxis />
                <Tooltip
                  formatter={(valor) => [
                    `${valor} ${unidad}`,
                    titulo,
                  ]}
                />
                <Line type="monotone" dataKey={campo} name={titulo} stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Crecimiento infantil
      </Typography>
      <Typography sx={{ mb: 3 }} color="text.secondary">
        Consulta la evolución de las mediciones registradas
        para cada infante.
      </Typography>
      <FormControl fullWidth sx={{ mb: 3, maxWidth: 500 }}>
        <InputLabel id="infante-label">
          Seleccionar infante
        </InputLabel>
        <Select labelId="infante-label" value={infanteId} label="Seleccionar infante" onChange={(event) => {
            const valor = String(event.target.value);
            setInfanteId(valor === "" ? "" : Number(valor));
          }}
        >
          {infantes.map((infante) => (
            <MenuItem key={infante.id} value={infante.id}>
              {infante.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {infanteId === "" ? (
        <Typography>
          Selecciona un infante para consultar sus gráficas.
        </Typography>
      ) : (
        <>
          {medicionesInfante.length === 0 ? (
            <Typography sx={{ mb: 3 }}>
              Este infante todavía no tiene mediciones registradas.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", }, gap: 2, mb: 3, }} >
                <GraficaLinea titulo="Evolución del peso" campo="pesoKg" unidad="kg" />
                <GraficaLinea titulo="Evolución de la talla" campo="tallaCm" unidad="cm" />
                <GraficaLinea titulo="Evolución del perímetro cefálico" campo="perimetroCefalicoCm" unidad="cm" />
              </Box>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Historial de IMC
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">
                        Peso (kg)
                      </TableCell>
                      <TableCell align="right">
                        Talla (cm)
                      </TableCell>
                      <TableCell align="right">
                        IMC (kg/m²)
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {datosGrafica.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.fechaCorta}</TableCell>
                        <TableCell align="right">
                          {m.pesoKg.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {m.tallaCm.toFixed(1)}
                        </TableCell>
                        <TableCell align="right">
                          {m.imc == null ? "No disponible" : m.imc.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                El IMC es un cálculo descriptivo. En población
                infantil, su interpretación depende de la edad,
                el sexo y las referencias de crecimiento aprobadas.
                Esta pantalla no emite diagnósticos.
              </Typography>
            </>
          )}
        </>
      )}
    </Box>
  );
}