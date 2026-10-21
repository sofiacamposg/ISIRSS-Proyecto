import { Layout, type LayoutProps, TitlePortal } from "react-admin";
//Header y Footer
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";
import { BarraLateral, MenuLateral } from "../components/MenuLateral";

export default function AppLayout({ children, ...props }: LayoutProps) {

function AppMenu() {
  const { permissions, isLoading } = usePermissions();
  if (isLoading) return <Menu />;
  const role = String(permissions ?? "");
  const esAdmin = role === "administrador";
  const esEstancia = role === "estancia";
  const esCoordinador = role === "coordinador_regional";
  const esTutor = role === "tutor";

  return (
    <Menu>
      <Menu.Item
        to="/"
        primaryText="Inicio"
        leftIcon={<HomeOutlined />}
      />
      {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="infantes" />}
      {(esAdmin || esCoordinador) && <Menu.ResourceItem name="regiones" />}
      {(esAdmin || esCoordinador) && <Menu.ResourceItem name="estados" />}
      {(esAdmin || esCoordinador) && <Menu.ResourceItem name="ebdis" />}
      {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="mediciones" />}
      {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="seguimientos" options={{ label: "Seguimiento nutricional" }} />}
      {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="crecimiento" />}
      {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="alertas" />}
      {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="reportes" />}
      {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="tutores" />}
      {(esAdmin) && <Menu.ResourceItem name="usuarios" />}
    </Menu>
  );
}

export default function AppLayout(props: LayoutProps) {
  return (
    <>
      <Layout
        {...props}
        appBar={Header}
        sidebar={BarraLateral}
        menu={MenuLateral}>
        {/* Título de la página: React-Admin lo llena según la página actual */}
        <TitlePortal
          component="h1"
          variant="h4"
          sx={{ color: "text.primary", fontWeight: 700, flex: "none", whiteSpace: "normal", mt: 2, mb: 1 }}
        />
        {children}
      </Layout>
      <Footer/>
    </>
  );
}