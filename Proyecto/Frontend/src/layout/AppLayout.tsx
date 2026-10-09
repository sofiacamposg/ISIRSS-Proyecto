import { Layout, type LayoutProps, Menu } from "react-admin";

function AppMenu() {
  return (
    <Menu>
      <Menu.DashboardItem primaryText="Inicio" />
      <Menu.ResourceItem name="infantes" />
    </Menu>
  );
}

export default function AppLayout(props: LayoutProps) {
  return <Layout {...props} menu={AppMenu} />;
}