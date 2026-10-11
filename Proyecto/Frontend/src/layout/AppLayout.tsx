import { Label } from "@mui/icons-material";
import { Layout, type LayoutProps, Menu } from "react-admin";

function AppMenu() {
  return (
    <Menu>
      <Menu.DashboardItem primaryText="Inicio" />
      <Menu.ResourceItem name="infantes" />
      <Menu.ResourceItem name="mediciones" />
      <Menu.ResourceItem name="seguimientos" options={{ label: "Seguimiento nutricional"}} />
    </Menu>
  );
}

export default function AppLayout(props: LayoutProps) {
  return <Layout {...props} menu={AppMenu} />;
}