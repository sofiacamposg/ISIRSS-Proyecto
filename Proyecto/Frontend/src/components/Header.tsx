import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
} from "@mui/material";

import { RefreshOutlined } from "@mui/icons-material";

import {
  SidebarToggleButton,
  useGetIdentity,
  usePermissions,
  ToggleThemeButton,
  UserMenu,
  Logout,
} from "react-admin";

import logoMex from "../assets/Logo_mex.png";

// Nombres de los roles del sistema
const nombresRoles: Record<string, string> = {
  administrador: "Administrador",
  coordinador_regional: "Coordinador regional",
  estancia: "Personal de EBDI",
  tutor: "Tutor",
};

export default function Header() {
  // Obtener información del usuario autenticado
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
        sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            borderBottom: "2px solid",
            borderColor: "primary.main",
        }}
    >
      <Toolbar className="app-header-toolbar">

        {/* Botón para abrir/cerrar sidebar */}
        <SidebarToggleButton />

        {/* Logo institucional */}
        <img
          src={logoMex}
          alt="Gobierno de México"
          className="app-header-logo"
        />

        {/* Nombre de la plataforma */}
        <Typography
          className="app-header-title"
          component="div"
        >
          Plataforma de Crecimiento y Desarrollo Saludable
        </Typography>

        {/* Acciones del encabezado */}
        <Box className="app-header-actions">

          {/* Cambiar entre modo claro y oscuro */}
          <ToggleThemeButton />

          {/* Actualizar la página */}
          <IconButton
            aria-label="Actualizar página"
            title="Actualizar página"
            onClick={() => window.location.reload()}
          >
            <RefreshOutlined />
          </IconButton>

          {/* Nombre, rol y menú de usuario */}
          <Box className="app-header-user">
            <Box>
              <Typography className="app-header-username">
                {nombre}
              </Typography>

              <Typography className="app-header-role">
                Rol: {nombreRol}
              </Typography>
            </Box>

            {/* Menú desplegable con cerrar sesión */}
            <UserMenu>
              <Logout />
            </UserMenu>
          </Box>

        </Box>
      </Toolbar>
    </AppBar>
  );
}