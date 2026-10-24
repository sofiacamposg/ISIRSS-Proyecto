//Imports
import { useState, type FormEvent } from "react";
import { useLogin, useNotify, Notification } from "react-admin";
import { Box, Paper, Typography, TextField, Button, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import logo from "../assets/Logo_mex.png";

//Función que se exporta a App.tsx
export default function Login() {
  const login = useLogin();
  const notify = useNotify();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Esta función manda los datos al AuthProvider para iniciar sesión.
  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCargando(true);

    try {
      await login({ username: correo, password });
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo iniciar sesión.", { type: "error" });
    } finally {
      setCargando(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper component="main" elevation={3} sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, width: "100%", maxWidth: 900, overflow: "hidden", borderRadius: 3 }}>

        {/* Panel izquierdo */}
        <Box sx={{ flex: 1, bgcolor: "primary.main", color: "primary.contrastText", p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
          <Typography variant="h4" component="h2" fontWeight={700}>
            Crecimiento y Desarrollo Saludable
          </Typography>
          <Typography variant="body1">
            Plataforma para el seguimiento de la salud y el crecimiento infantil.
          </Typography>
        </Box>

        {/* Forms de acceso */}
        <Box component="form" onSubmit={iniciarSesion} sx={{ flex: 1, p: { xs: 3, sm: 4, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Box component="img" src={logo} alt="Gobierno de México"
              sx={{ width: 140, maxWidth: "100%", height: "auto", objectFit: "contain" }} />
          </Box>

          <Typography variant="h4" component="h1" fontWeight={700}>Iniciar sesión</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Ingresa tus datos para continuar.</Typography>

          <TextField label="Correo electrónico" type="email" value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            autoComplete="username" required fullWidth />

          <TextField label="Contraseña" type={mostrarPassword ? "text" : "password"} value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password" required fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setMostrarPassword(!mostrarPassword)}
                      aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} edge="end">
                      {mostrarPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <Button type="submit" variant="contained" size="large" disabled={cargando} fullWidth sx={{ mt: 2 }}>
            {cargando ? <CircularProgress size={24} color="inherit" aria-label="Iniciando sesión" /> : "Ingresar"}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            Acceso exclusivo para usuarios autorizados.
          </Typography>
        </Box>
      </Paper>

      <Notification />
    </Box>
  );
}
