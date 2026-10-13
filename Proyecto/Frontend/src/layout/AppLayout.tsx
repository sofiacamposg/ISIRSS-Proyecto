import {Layout, type LayoutProps, Menu, usePermissions, AppBar, TitlePortal, UserMenu, Logout,} from "react-admin";
import { ListSubheader } from "@mui/material";

function AppMenu() {
    const { permissions, isLoading } = usePermissions();

    if (isLoading) {
        return <Menu />;
    }

    const role = String(permissions ?? "");

    const esAdmin = role === "administrador";
    const esEstancia = role === "estancia";
    const esCoordinador = role === "coordinador_regional";
    const esTutor = role === "tutor";

    const puedeVerOperaciones =
        esAdmin || esEstancia || esCoordinador || esTutor;

    const puedeVerCatalogos = esAdmin || esCoordinador;
    const puedeVerReportes = esAdmin || esEstancia || esCoordinador;

    return (
        <Menu>
            <Menu.DashboardItem primaryText="Inicio" />

            {puedeVerOperaciones && (
                <ListSubheader component="div" disableSticky>
                    Padrón y seguimiento
                </ListSubheader>
            )}

            {puedeVerOperaciones && <Menu.ResourceItem name="infantes" />}
            {puedeVerOperaciones && <Menu.ResourceItem name="mediciones" />}
            {puedeVerOperaciones && (
                <Menu.ResourceItem
                    name="seguimientos"
                    options={{ label: "Seguimiento nutricional" }}
                />
            )}
            {puedeVerOperaciones && <Menu.ResourceItem name="crecimiento" />}
            {puedeVerOperaciones && <Menu.ResourceItem name="alertas" />}

            {puedeVerCatalogos && (
                <ListSubheader component="div" disableSticky>
                    Organización
                </ListSubheader>
            )}

            {puedeVerCatalogos && <Menu.ResourceItem name="regiones" />}
            {puedeVerCatalogos && <Menu.ResourceItem name="estados" />}
            {puedeVerCatalogos && <Menu.ResourceItem name="ebdis" />}

            {puedeVerReportes && (
                <ListSubheader component="div" disableSticky>
                    Análisis
                </ListSubheader>
            )}

            {puedeVerReportes && <Menu.ResourceItem name="reportes" />}
        </Menu>
    );
}

function InstitutionalAppBar() {
    return (
        <AppBar
            color="default"
            elevation={0}
            userMenu={
                <UserMenu>
                    <Logout />
                </UserMenu>
            }
        >
            <TitlePortal />
        </AppBar>
    );
}

export default function AppLayout(props: LayoutProps) {
    return (
        <Layout
            {...props}
            appBar={InstitutionalAppBar}
            menu={AppMenu}
        />
    );
}