//Uso de AI: La página fue generada como template pues no se contaba con la informaión real
import {
  Box,
  Typography,
  Divider,
  Alert,
  Paper,
  Stack,
} from "@mui/material";

import {
  HelpOutline,
  LoginOutlined,
  MenuOutlined,
  ChildCareOutlined,
  StraightenOutlined,
  ShowChartOutlined,
  AssignmentOutlined,
  ManageAccountsOutlined,
  SupportAgentOutlined,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import PaginaInstitucional from "../components/PaginaInstitucional";

export default function Ayuda() {
  return (
    <PaginaInstitucional
      titulo="Centro de ayuda"
      descripcion="Guía de uso de la Plataforma de Crecimiento y Desarrollo Saludable."
    >
      {/* Introducción */}
      <Alert
        severity="info"
        icon={<InfoOutlined />}
        sx={{ mb: 4 }}
      >
        Bienvenido al Centro de Ayuda. Aquí encontrarás
        información para navegar por la plataforma,
        consultar expedientes y utilizar las funciones
        disponibles según tu perfil de usuario.
      </Alert>

      {/* Sección 1 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <LoginOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          1. Inicio de sesión
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Para acceder a la plataforma, introduce tus
          credenciales de usuario en la pantalla de inicio
          de sesión. Una vez autenticado, podrás consultar
          las funcionalidades correspondientes a tu rol.
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Para cerrar sesión, utiliza el menú de usuario
          ubicado en la esquina superior derecha y
          selecciona la opción "Cerrar sesión".
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Sección 2 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <MenuOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          2. Navegación por la plataforma
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Utiliza el menú lateral izquierdo para acceder
          a las distintas secciones del sistema.
          Las opciones visibles dependerán de los permisos
          asociados con tu perfil.
        </Typography>

        <Box
          component="ul"
          sx={{ pl: 4, color: "text.secondary", lineHeight: 2 }}
        >
          <li>Inicio: resumen general de la información.</li>
          <li>Infantes: consulta de expedientes infantiles.</li>
          <li>Mediciones: registro y consulta de medidas.</li>
          <li>Seguimiento nutricional: consulta de casos.</li>
          <li>Gráficas de crecimiento: visualización de datos.</li>
          <li>Alertas: situaciones que requieren atención.</li>
          <li>Reportes: consulta de información consolidada.</li>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Sección 3 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <ChildCareOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          3. Consulta de expedientes infantiles
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          En la sección "Infantes" puedes consultar
          información general de los menores registrados
          en la plataforma, según tus permisos de acceso.
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Los expedientes pueden incluir datos de
          identificación, estancia asignada, información
          de tutores y mediciones registradas.
        </Typography>
      </Box>

      {/* Sección 4 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <StraightenOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          4. Mediciones antropométricas
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          La sección "Mediciones" permite consultar
          los registros antropométricos de los infantes.
          Los usuarios con los permisos correspondientes
          también pueden registrar nuevas mediciones.
        </Typography>

        <Box
          component="ul"
          sx={{ pl: 4, color: "text.secondary", lineHeight: 2 }}
        >
          <li>Peso: expresado en kilogramos (kg).</li>
          <li>Talla: expresada en centímetros (cm).</li>
          <li>Perímetro cefálico: expresado en centímetros (cm).</li>
          <li>Fecha en la que se realizó la medición.</li>
        </Box>
      </Box>

      {/* Sección 5 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <ShowChartOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          5. Gráficas de crecimiento
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Las gráficas permiten visualizar la evolución
          de las mediciones registradas a lo largo
          del tiempo y facilitar su consulta.
        </Typography>

        <Alert severity="warning" sx={{ mt: 2 }}>
          Las gráficas y mediciones no representan
          un diagnóstico médico. Su interpretación
          clínica corresponde a profesionales de la salud.
        </Alert>
      </Box>

      {/* Sección 6 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <AssignmentOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          6. Seguimiento nutricional
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Esta sección permite consultar información
          relacionada con los casos que requieren
          seguimiento nutricional.
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          El registro y la modificación de información
          están disponibles únicamente para los usuarios
          que cuentan con los permisos correspondientes.
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Sección 7 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <ManageAccountsOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          7. Permisos según el tipo de usuario
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {[
            {
              rol: "Administrador",
              descripcion:
                "Administra la información y los recursos habilitados del sistema.",
            },
            {
              rol: "Coordinador regional",
              descripcion:
                "Consulta información de las regiones y estancias bajo su responsabilidad.",
            },
            {
              rol: "Personal de EBDI",
              descripcion:
                "Consulta expedientes y registra información según sus permisos.",
            },
            {
              rol: "Padre, madre o tutor",
              descripcion:
                "Consulta la información de los infantes asociados con su cuenta.",
            },
          ].map((item) => (
            <Paper
              key={item.rol}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Typography fontWeight={700} color="primary.main">
                {item.rol}
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {item.descripcion}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* Sección 8 */}
      <Box sx={{ mb: 4 }}>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <WarningAmberOutlined
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          8. Solución de problemas frecuentes
        </Typography>

        <Typography fontWeight={700} sx={{ mt: 2 }}>
          No puedo iniciar sesión.
        </Typography>
        <Typography color="text.secondary">
          Verifica tus credenciales de acceso y solicita
          asistencia al responsable del sistema si el
          problema continúa.
        </Typography>

        <Typography fontWeight={700} sx={{ mt: 2 }}>
          No encuentro una sección.
        </Typography>
        <Typography color="text.secondary">
          Algunas funciones están restringidas según
          el rol del usuario.
        </Typography>

        <Typography fontWeight={700} sx={{ mt: 2 }}>
          No puedo modificar información.
        </Typography>
        <Typography color="text.secondary">
          Es posible que tu perfil tenga únicamente
          permisos de consulta.
        </Typography>

        <Typography fontWeight={700} sx={{ mt: 2 }}>
          La información de un expediente es incorrecta.
        </Typography>
        <Typography color="text.secondary">
          Comunícate con el personal autorizado para
          solicitar la revisión correspondiente.
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Sección 9 */}
      <Box>
           <Typography variant="h6" component="h2" fontWeight={700} color="primary.main" gutterBottom>
          <SupportAgentOutlined
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          9. Soporte y asistencia
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Si necesitas asistencia adicional, comunícate
          con el administrador o responsable institucional
          correspondiente.
        </Typography>

        <Alert
          severity="info"
          icon={<HelpOutline />}
          sx={{ mt: 3 }}
        >
          Los canales oficiales de soporte serán
          incorporados cuando estén disponibles.
        </Alert>
      </Box>
    </PaginaInstitucional>
  );
}