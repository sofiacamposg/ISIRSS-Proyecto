import { useState } from "react";
import { useGetList, useGetManyReference } from "react-admin";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,} from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, } from "recharts";

type Infante = {
  id: number;
  nombre_completo: string;
};

type Medicion = {
    id: number;
    id_medicion: number;
    id_infante: number;
    fecha_medicion: string;
    peso_kg: number;
    talla_cm: number;
    perimetro_cefalico_cm?: number | null;
    observaciones?: string | null;
};

export function CrecimientoPage() {
  const [infanteId, setInfanteId] = useState<number | "">("");
  const {
    data: infantes = [],
    isPending: cargandoInfantes,
    error: errorInfantes,
  } = useGetList<Infante>("infantes", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "nombre_completo", order: "ASC" },
  });
  const {
    data: mediciones = [],
    isPending: cargandoMediciones,
    error: errorMediciones,
  } = useGetManyReference<Medicion>("mediciones", {
    target: "id_infante",
    id: infanteId === "" ? 0 : infanteId,
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "fecha_medicion", order: "ASC" },
  }, {
    enabled: infanteId !== "",
  });
  if (cargandoInfantes || (infanteId !== "" && cargandoMediciones)) {
      return <Typography>Cargando información...</Typography>;
  }
  if (errorInfantes || (infanteId !== "" && errorMediciones)) {
      return (
          <Typography color="error">
              No fue posible cargar los datos de crecimiento.
          </Typography>
      );
  }
  const medicionesInfante = [...mediciones].sort(
    (a, b) =>
      new Date(a.fecha_medicion).getTime() -
      new Date(b.fecha_medicion).getTime()
  );

  const datosGrafica = medicionesInfante.map((m) => {
    const fecha = new Date(m.fecha_medicion);
    const pesoKg = Number(m.peso_kg);
    const tallaCm = Number(m.talla_cm);

    return {
      id: m.id_medicion ?? m.id,
      fecha: m.fecha_medicion,
      fechaCorta: fecha.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }),
      pesoKg,
      tallaCm,
      perimetroCefalicoCm:
        m.perimetro_cefalico_cm == null
          ? null
          : Number(m.perimetro_cefalico_cm),
      observaciones: m.observaciones,
      imc:
        tallaCm > 0
          ? pesoKg / Math.pow(tallaCm / 100, 2)
          : null,
    };
  });

  console.log("Infante seleccionado:", infanteId);
  console.log("Mediciones recibidas:", mediciones);
  console.log("Cantidad de mediciones:", mediciones.length);
  console.log("Datos de las gráficas:", datosGrafica);

  function GraficaLinea({titulo, campo, unidad,}: {
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
        Consulta la evolución de las mediciones registradas para cada infante.
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
              {infante.nombre_completo}
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} >
                El IMC es un cálculo descriptivo. En población infantil, su interpretación depende de la edad, el sexo y las referencias de crecimiento aprobadas.
                Esta pantalla no emite diagnósticos.
              </Typography>
            </>
          )}
        </>
      )}
    </Box>
  );
}