import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" className="app-footer">
      <Typography className="app-footer-disclaimer">
        Esta plataforma registra y muestra mediciones.
        No emite diagnósticos médicos.
      </Typography>

      <Box className="app-footer-links">
        <span>Aviso de privacidad</span>
        <span>Declaración de accesibilidad</span>
        <span>Ayuda</span>
      </Box>
    </Box>
  );
}