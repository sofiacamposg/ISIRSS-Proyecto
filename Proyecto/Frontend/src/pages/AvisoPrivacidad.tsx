import {
  Box,
  Typography,
  Divider,
  Alert,
} from "@mui/material";

import {
  SecurityOutlined,
  DescriptionOutlined,
  LockOutlined,
  ContactMailOutlined,
  InfoOutlined,
} from "@mui/icons-material";

import PaginaInstitucional from "../components/PaginaInstitucional";

export default function AvisoPrivacidad() {
  return (
    <PaginaInstitucional
      titulo="Aviso de privacidad"
      descripcion="Información sobre el tratamiento y protección de los datos personales registrados en la Plataforma de Crecimiento y Desarrollo Saludable."
    >
      {/* Aviso provisional */}
      <Alert severity="info" icon={<InfoOutlined />} sx={{ mb: 4 }}>
        Este contenido es informativo y provisional.
        El aviso de privacidad oficial deberá ser validado
        y aprobado por la institución responsable.
      </Alert>

      {/* Introducción */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Protección de datos personales
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          La Plataforma de Crecimiento y Desarrollo Saludable
          tiene como propósito facilitar el registro, consulta
          y seguimiento de información relacionada con el
          crecimiento y desarrollo de los infantes inscritos
          en las Estancias para el Bienestar y Desarrollo
          Infantil (EBDI).
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Sección 1 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          gutterBottom
        >
          <DescriptionOutlined
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          1. Información registrada
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          La plataforma contempla el registro y consulta de
          información relacionada con:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 4,
            color: "text.secondary",
            lineHeight: 2,
          }}
        >
          <li>Datos de identificación de los infantes.</li>
          <li>Información de padres, madres o tutores.</li>
          <li>Estancia (EBDI) a la que pertenece el infante.</li>
          <li>Mediciones de peso, talla y perímetro cefálico.</li>
          <li>Historial de crecimiento y seguimiento nutricional.</li>
        </Box>
      </Box>

      {/* Sección 2 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          gutterBottom
        >
          2. Finalidad del tratamiento de los datos
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          La información registrada tiene como finalidad
          apoyar la administración de expedientes infantiles,
          consultar mediciones antropométricas y facilitar
          el seguimiento realizado por el personal autorizado.
        </Typography>
      </Box>

      {/* Sección 3 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          gutterBottom
        >
          <LockOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          3. Acceso a la información
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          El acceso a la plataforma se organiza mediante
          perfiles y permisos de usuario. Cada persona debe
          consultar únicamente la información que corresponda
          a sus funciones y autorizaciones.
        </Typography>
      </Box>

      {/* Sección 4 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          gutterBottom
        >
          <SecurityOutlined sx={{ verticalAlign: "middle", mr: 1 }} />
          4. Protección de la información
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          El tratamiento de la información personal debe
          realizarse conforme a las disposiciones legales
          aplicables y las políticas de seguridad y
          confidencialidad establecidas por la institución.
        </Typography>
      </Box>

      {/* Sección 5 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          gutterBottom
        >
          5. Derechos de los titulares
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Los titulares de los datos personales o sus
          representantes legales podrán ejercer los derechos
          que correspondan conforme a la legislación aplicable,
          mediante los canales oficiales designados por la
          institución responsable.
        </Typography>
      </Box>

      {/* Sección 6 */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          gutterBottom
        >
          <ContactMailOutlined
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          6. Contacto institucional
        </Typography>

        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Para consultas relacionadas con la protección de
          datos personales, comunícate mediante los canales
          oficiales de atención que indique la institución.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Advertencia médica */}
      <Alert severity="warning">
        Esta plataforma registra y muestra mediciones.
        No emite diagnósticos médicos ni sustituye
        la valoración de profesionales de la salud.
      </Alert>
    </PaginaInstitucional>
  );
}