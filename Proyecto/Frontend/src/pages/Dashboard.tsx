import { Box, Typography, Card, CardContent, Grid, Button, Stack } from "@mui/material";
import { Title, useGetList, usePermissions, ListBase, Datagrid, TextField, DateField, ShowButton, SelectField } from "react-admin";
import type { ReactNode } from "react";
import { AddOutlined, StraightenOutlined, ShowChartOutlined, DescriptionOutlined } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

// tarjeta con números
function TarjetaResumen({ titulo, valor, descripcion }: { titulo: string; valor: ReactNode; descripcion: string }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" component="h3" color="text.secondary">
          {titulo}
        </Typography>
        <Typography variant="h4" component="p" sx={{ fontWeight: 700, my: 1 }}>
          {valor}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descripcion}
        </Typography>
      </CardContent>
    </Card>
  );
}

const useTotal = (recurso: string) => {
  const { total, isPending, error } = useGetList(recurso, {
    pagination: { page: 1, perPage: 1 }, // solo pedimos 1 registro por que nos interesa el total, no la lista
  });

  if (isPending) {
    return "Cargando…";
  }
  if (error || total === undefined) {
    return "No disponible";
  }
  return total.toLocaleString("es-MX"); // agrega comita
};

const Dashboard = () => {
  const { permissions } = usePermissions();
  const esTutor = permissions === "tutor"; // el tutor no debe ver totales de todo el padrón
  const puedeRegistrar = permissions === "administrador" || permissions === "estancia";
  const totalInfantes = useTotal("infantes");
  const totalMediciones = useTotal("mediciones");
  const totalSeguimientos = useTotal("seguimientos");
  const totalAlertas = useTotal("alertas");

  return (
    <Box sx={{ pb: 4 }}>
      <Title title="Inicio" />

      {/* descripción corta de la página */}
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Resumen del padrón infantil. Revisa las alertas y registra las mediciones pendientes.
      </Typography>

      {/* resumen (no visible para tutores) */}
      {!esTutor && (
        <Box component="section" aria-labelledby="titulo-resumen" sx={{ mb: 4 }}>
          <Typography id="titulo-resumen" variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Resumen del padrón
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TarjetaResumen titulo="Infantes registrados" valor={totalInfantes} descripcion="Expedientes en el padrón." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TarjetaResumen titulo="Mediciones" valor={totalMediciones} descripcion="Registros de peso, talla y perímetro cefálico." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TarjetaResumen titulo="Seguimientos nutricionales" valor={totalSeguimientos} descripcion="Casos registrados." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TarjetaResumen titulo="Alertas" valor={totalAlertas} descripcion="Alertas registradas que requieren revisión." />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* acciones rápidas */}
      <Box component="section" aria-labelledby="titulo-acciones" sx={{ mb: 4 }}>
        <Typography id="titulo-acciones" variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
          Acciones rápidas
        </Typography>

        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.5 }}>
          {puedeRegistrar && (
            <Button component={RouterLink} to="/mediciones/create" variant="contained" startIcon={<StraightenOutlined />}>
              Registrar medición
            </Button>
          )}
          {puedeRegistrar && (
            <Button component={RouterLink} to="/infantes/create" variant="contained" startIcon={<AddOutlined />}>
              Registrar infante
            </Button>
          )}
          <Button component={RouterLink} to="/crecimiento" variant="outlined" startIcon={<ShowChartOutlined />}>
            Consultar gráficas de crecimiento
          </Button>
          {!esTutor && (
            <Button component={RouterLink} to="/reportes" variant="outlined" startIcon={<DescriptionOutlined />}>
              Ver reportes
            </Button>
          )}
        </Stack>
      </Box>
      {/* infantes registrados recientemente (no visible para tutores) */}
      {!esTutor && (
        <Box component="section" aria-labelledby="titulo-recientes" sx={{ mb: 4 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Typography id="titulo-recientes" variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              Infantes registrados recientemente
            </Typography>
            <Button component={RouterLink} to="/infantes">
              Ver todos los infantes
            </Button>
          </Stack>

          <Card variant="outlined">
            <ListBase resource="infantes" perPage={5} sort={{ field: "id", order: "DESC" }} disableSyncWithLocation>
              <Datagrid bulkActionButtons={false} rowClick={false}>
                <TextField source="matricula" label="Matrícula" />
                <TextField source="nombre_completo" label="Nombre completo" />
                <DateField source="fecha_medicion" label="Última medición" emptyText="Sin medición" />
                <SelectField source="estado" label="Estado de seguimiento" emptyText="Sin seguimiento"
                  choices={[
                    { id: "requiere_seguimiento", name: "Requiere seguimiento" },
                    { id: "en_seguimiento", name: "En seguimiento" },
                    { id: "concluido", name: "Seguimiento concluido" },
                  ]}
                />
                <ShowButton label="Ver ficha" />
              </Datagrid>
            </ListBase>
          </Card>
        </Box>
      )}
      <Box component="section" aria-labelledby="titulo-glosario" sx={{ mb: 4 }}>
        <Typography id="titulo-glosario" variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
          Términos de la plataforma
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Box component="dl" sx={{ m: 0, display: "grid", gap: 2 }}>
              <Box>
                <Typography component="dt" sx={{ fontWeight: 700, color: "primary.main" }} >EBDI</Typography>
                <Typography component="dd" sx={{ m: 0 }} color="text.secondary">
                  Estancias para el Bienestar y Desarrollo Infantil.
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" sx={{ fontWeight: 700, color: "primary.main" }} >IMC</Typography>
                <Typography component="dd" sx={{ m: 0 }} color="text.secondary">
                  El índice de masa corporal (IMC) sirve para medir la relación entre el peso y la talla, lo que  permite identificar el sobrepeso y la obesidad en adultos.
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" sx={{ fontWeight: 700, color: "primary.main" }} >CDC</Typography>
                <Typography component="dd" sx={{ m: 0 }} color="text.secondary">
                  Los CDC (por sus siglas en inglés, Centers for Disease Control and Prevention, o Centros para el Control y la Prevención de Enfermedades) son la agencia nacional de salud pública de Estados Unidos.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;