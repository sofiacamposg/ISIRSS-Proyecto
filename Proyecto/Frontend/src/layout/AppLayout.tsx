import { Layout, type LayoutProps, Menu, usePermissions } from "react-admin";

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
      <Menu.DashboardItem primaryText="Inicio" />
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
    </Menu>
  );
}

export default function AppLayout(props: LayoutProps) {
  return <Layout {...props} menu={AppMenu} />;
}