import { AppBar, Toolbar, Box, Typography, IconButton, Divider, Avatar } from "@mui/material";

import { RefreshOutlined, PersonOutline } from "@mui/icons-material";

import { SidebarToggleButton, useGetIdentity, usePermissions, UserMenu, Logout } from "react-admin";

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
      sx={{ backgroundColor: "background.paper", color: "primary.main", borderBottom: "3px solid", borderColor: "primary.main", }}>
      <Toolbar className="app-header-toolbar">

        {/* Botón para abrir/cerrar sidebar */}
        <SidebarToggleButton />

        {/* Logo institucional */}
        <img src={logoMex}
          alt="Gobierno de México"
          className="app-header-logo"
        />

        {/* MUI divider, línea separadora decorativa */}
        <Divider orientation="vertical" aria-hidden="true" sx={{ height: 36, alignSelf: "center" }} />

        {/* Nombre de la plataforma */}
        <Typography
          className="app-header-title"
          component="div"
          variant="subtitle1"
          sx={{ fontWeight: 700, flex: 1 }}
        >
          Plataforma de Crecimiento y Desarrollo Saludable
        </Typography>

        {/* Acciones del encabezado */}
        <Box className="app-header-actions">

          {/* Actualizar la página */}
          <IconButton
            color="inherit"
            aria-label="Actualizar página"
            title="Actualizar página"
            onClick={() => window.location.reload()}
          >
            <RefreshOutlined />
          </IconButton>

          {/* Menú de usuario, muestra el nombre y el rol */}
          <Box className="app-header-user">
            <UserMenu
              icon={
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                  <PersonOutline fontSize="small" />
                </Avatar>
              }
            >
              <Logout />
            </UserMenu>

            <Typography variant="body2" color="text.secondary" className="app-header-role">
              Rol: {nombreRol}
            </Typography>
          </Box>

        </Box>
      </Toolbar>
    </AppBar>
  );
}