import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import PaginaInstitucional from "../components/PaginaInstitucional";

const preguntas = [
  {
    pregunta: "¿Para qué sirve esta plataforma?",
    respuesta:
      "Permite registrar, consultar y dar seguimiento a la información relacionada con el crecimiento y desarrollo infantil.",
  },
  {
    pregunta: "¿Quién puede acceder a la plataforma?",
    respuesta:
      "Los administradores, coordinadores regionales, personal de EBDI y tutores autorizados.",
  },
  {
    pregunta: "¿Qué mediciones se registran?",
    respuesta:
      "Peso, talla y perímetro cefálico, entre otras mediciones relacionadas con el crecimiento infantil.",
  },
  {
    pregunta: "¿La plataforma proporciona diagnósticos médicos?",
    respuesta:
      "No. La plataforma registra y muestra mediciones, pero no emite diagnósticos médicos.",
  },
  {
    pregunta: "¿Qué hago si encuentro información incorrecta?",
    respuesta:
      "Comunícate con el personal autorizado de tu estancia para solicitar una revisión.",
  },
];

export default function PreguntasFrecuentes() {
  return (
    <PaginaInstitucional
      titulo="Preguntas frecuentes"
      descripcion="Encuentra respuestas a las dudas más comunes sobre la plataforma."
    >
      {preguntas.map((item) => (
        <Accordion key={item.pregunta}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {item.pregunta}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>{item.respuesta}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </PaginaInstitucional>
  );
}