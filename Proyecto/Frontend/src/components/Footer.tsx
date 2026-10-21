import { Box, Typography } from "@mui/material";
import { Link } from "react-admin";

export default function Footer() {
  return (
    <Box 
      component="footer" 
      className="app-footer"
      sx={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "background.default",
        px: 3,
      }}
    >
      <Typography className="app-footer-disclaimer">
        Esta plataforma registra y muestra mediciones.
        No emite diagnósticos médicos.
      </Typography>

      <nav aria-label="Enlaces del pie de página">
        <ul className="app-footer-links">
          <li><Link to="/aviso-de-privacidad">Aviso de privacidad</Link></li>
          <li><Link to="/accesibilidad">Declaración de accesibilidad</Link></li>
          <li><Link to="/ayuda">Ayuda</Link></li>
        </ul>
      </nav>
    </Box>
  );
}