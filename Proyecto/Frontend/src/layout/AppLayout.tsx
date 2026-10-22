import { Layout, type LayoutProps, TitlePortal } from "react-admin";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { BarraLateral, MenuLateral } from "../components/MenuLateral";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AppLayout({ children, ...props }: LayoutProps) {
  
  const { pathname } = useLocation(); // dirección de la página actual

  // cada vez que cambia la página, mover el foco al título h1
  // usuarios de teclado o lector de pantalla comienzan en el contenido y no en el menú

  useEffect(() => {
    const titulo = document.getElementById("react-admin-title");
    if (titulo) {
      titulo.setAttribute("tabindex", "-1"); // enfocar h1 sin agregarlo al orden de tab
      titulo.focus();
    }
  }, [pathname]);
  
  return (
    <Layout {...props} appBar={Header} sidebar={BarraLateral} menu={MenuLateral}>
      {/* margen lateral para todas las páginas, evita que se vea pegado a los lados*/}
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {/* título de la página: React-Admin lo llena según la página actual */}
        <TitlePortal component="h1" variant="h4"
          sx={{ color: "text.primary", fontWeight: 700, flex: "none", whiteSpace: "normal", mt: 2, mb: 1, "&:empty": { display: "none" } }} />
        {children}
      </Box>
      <Footer />
    </Layout>
  );
}