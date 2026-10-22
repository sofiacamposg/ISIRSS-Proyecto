import { Box, Typography, Button } from "@mui/material";
import { Link, useSidebarState } from "react-admin";
import { ArrowUpwardOutlined } from "@mui/icons-material";

export default function Footer() {

  // función para volver arriba
  function volverArriba() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  const [menuAbierto] = useSidebarState(); // guarda el estado del menu, si esta abierto o cerrado
  let anchoMenu = "55px"; // 55px cerrado, solo íconos, 240px abierto, son los valores default de React-admin
  if (menuAbierto) {
    anchoMenu = "240px";
  }

  return (
    <Box 
      component="footer"
      role="contentinfo"
      className="app-footer"
      sx={{ mt: "auto", px: 3,}}>
      <Typography variant="body2" color="text.secondary">
        Esta plataforma registra y muestra mediciones.
        No emite diagnósticos médicos.
      </Typography>

      <nav aria-label="Enlaces del pie de página">
        <ul className="app-footer-links">
          <li><Link to="/aviso-de-privacidad">Aviso de privacidad</Link></li>
          <li><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link></li>
          <li><Link to="/ayuda">Ayuda</Link></li>
          <li>
            <Button onClick={volverArriba} size="small" startIcon={<ArrowUpwardOutlined />}>
            Volver arriba
            </Button>
          </li>
        </ul>
      </nav>
    </Box>
  );
}