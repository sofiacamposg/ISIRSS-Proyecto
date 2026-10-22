import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  titulo: string;
  descripcion: string;
  children: ReactNode;
}

export default function PaginaInstitucional({
  titulo,
  descripcion,
  children,
}: Props) {
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        {titulo}
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {descripcion}
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, bgcolor: "background.paper", color: "text.primary",}}>
        {children}
      </Paper>
    </Box>
  );
}