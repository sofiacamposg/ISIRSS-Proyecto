import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";

import { RefreshOutlined } from "@mui/icons-material";
import {
  SidebarToggleButton,
  useGetIdentity,
  usePermissions,
} from "react-admin";

import logoMex from "../assets/Logo_mex.png";

const nombresRoles: Record<string, string> = {
  administrador: "Administrador",
  coordinador_regional: "Coordinador regional",
  estancia: "Personal de EBDI",
  tutor: "Tutor",
};

export default function Header() {
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();

  const rol = String(permissions ?? "");
  const nombre = identity?.fullName ?? "Usuario";
  const nombreRol = nombresRoles[rol] ?? "Usuario";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="app-header"
    >
      <Toolbar className="app-header-toolbar">
        <SidebarToggleButton />

        <img
          src={logoMex}
          alt="Gobierno de México"
          className="app-header-logo"
        />

        <Typography
          className="app-header-title"
          component="div"
        >
          Plataforma de Crecimiento y Desarrollo Saludable
        </Typography>

        <Box className="app-header-actions">
          <IconButton
            aria-label="Actualizar página"
            title="Actualizar página"
            onClick={() => window.location.reload()}
          >
            <RefreshOutlined />
          </IconButton>

          <Box className="app-header-user">
            <Avatar className="app-header-avatar">
              {nombre.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography className="app-header-username">
                {nombre}
              </Typography>

              <Typography className="app-header-role">
                Rol: {nombreRol}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}