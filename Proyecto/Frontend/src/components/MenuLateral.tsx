import { Menu, Sidebar, usePermissions, useSidebarState, type SidebarProps } from "react-admin";
import { Box, ListSubheader } from "@mui/material";
import { HomeOutlined } from "@mui/icons-material";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// & <- significa "este mismo componente", es decir el menu al que se le aplica para este código 
// & .Clase <- apunta a sus hijos
// &.Clase apunta al propio componente cuando tiene esa clase

// Estilos de los elementos del menú, texto e íconos blancos
const estilosMenu = {
    // cada opción dentro del menú 
    "& .RaMenuItemLink-root": {
        color: "common.white",
        minHeight: 44,
        borderRadius: 2,
        mx: 1,
        py: 1,
        alignItems: "center",
    },
    // React-Admin le pone a MUI noWrap, se activa
    // con el menú abierto, el texto de cada opción hace salto de línea
    "&.RaMenu-open .RaMenuItemLink-root, &.RaMenu-open .RaMenuItemLink-root .MuiTypography-noWrap": {
        whiteSpace: "normal",
    },
    // el ícono dentro de cada opción en blanco
    "& .RaMenuItemLink-root .RaMenuItemLink-icon": {
        color: "common.white",
    },
    // cada opción al haver hover, blanco con opacidad
    "& .RaMenuItemLink-root:hover": {
        backgroundColor: "#ffffff1f",
    },
    // la opción que además es la página actual
    "& .RaMenuItemLink-root.RaMenuItemLink-active": { // cada elemento del menu (hijos) y cada elemento del menu activo
        color: "primary.main",
        backgroundColor: "common.white",
        fontWeight: 700,
    },
    // el ícono dentro de la opción activa, color guinda
    "& .RaMenuItemLink-root.RaMenuItemLink-active .RaMenuItemLink-icon": {
        color: "primary.main", // ícono guinda
    },

    // con el menú cerrado, cada opción va centrada
    "&.RaMenu-closed .RaMenuItemLink-root": {
        px: 2,
        justifyContent: "center",
    },
    // con el menú cerrado, el ícono sin ancho mínimo para que se vea solo el ícono
    "&.RaMenu-closed .RaMenuItemLink-icon": {
        minWidth: 0,
    },
}

// Barra lateral con fondo guinda
export function BarraLateral(props: SidebarProps) {
    return (
        <Sidebar
            {...props} // todas las propiedades que React-Admin le pasa al panel
            sx={{
                height: "auto",
                alignSelf: "stretch",
                "& .MuiPaper-root": { backgroundColor: "primary.main", height: "100%", },
                "& .RaSidebar-fixed": { backgroundColor: "primary.main", position: "static", height: "auto", }
            }}
        />
    );
}

// Categorías del menú, solo son visibles con el menú abierto
function Categoria({ children }: { children: ReactNode }) {
    const [abierto] = useSidebarState();
    if (!abierto) return null;

    return (
        <ListSubheader
            sx={{
                backgroundColor: "transparent",
                color: "#e6d194",
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 2.5,
            }}
        >
            {children}
        </ListSubheader>
    );
}

// Opciones del menú según el rol del usuario
export function MenuLateral() {
    const { permissions, isLoading } = usePermissions();
    const { pathname } = useLocation(); // hook de React Router, da info de la dirección actual de la página

    // función que recibe una ruta, : indica que es texto
    function paginaActual(ruta: string) {
        if (ruta === "/") { // si es inicio
            if (pathname === "/") { // solo es la actual si estoy exactamente en /
                return "page";
            }
            return undefined;
        }

        if (pathname.startsWith(ruta)) {
            return "page";
        }

        return undefined;
    }

    if (isLoading) return <Menu sx={estilosMenu} />;

    const role = String(permissions ?? "");
    const esAdmin = role === "administrador";
    const esEstancia = role === "estancia";
    const esCoordinador = role === "coordinador_regional";
    const esTutor = role === "tutor";

    return (
        <Box component="nav" aria-label="Menú principal">
            <Menu sx={estilosMenu}>
                <Categoria>Principal</Categoria>
                <Menu.Item to="/" primaryText="Inicio" leftIcon={<HomeOutlined />} aria-current={paginaActual("/")} />
                {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="infantes" aria-current={paginaActual("/infantes")} />}
                {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="mediciones" aria-current={paginaActual("/mediciones")} />}
                {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="condiciones" options={{ label: "Condiciones de Salud" }} aria-current={paginaActual("/condiciones")} />}
                {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="seguimientos" options={{ label: "Seguimiento nutricional" }} aria-current={paginaActual("/seguimientos")} />}
                {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="acciones_seguimiento" options={{ label: "Acciones a Seguimientos" }} aria-current={paginaActual("/acciones_seguimiento")} />}
                {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="crecimiento" aria-current={paginaActual("/crecimiento")} />}

                {(esAdmin || esEstancia || esCoordinador) && <Categoria>Gestión</Categoria>}
                {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="alertas" aria-current={paginaActual("/alertas")} />}
                {(esAdmin || esCoordinador) && <Menu.ResourceItem name="reportes" aria-current={paginaActual("/reportes")} />}
                {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="tutores" aria-current={paginaActual("/tutores")} />}
                {(esAdmin) && <Menu.ResourceItem name="usuarios" aria-current={paginaActual("/usuarios")} />}
                {(esAdmin) && <Menu.ResourceItem name="infante_tutor" options={{ label: "Autorizaciones de tutores"}} aria-current={paginaActual("/infante_tutor")} />}

                {(esAdmin || esCoordinador) && <Categoria>Catálogos</Categoria>}
                {(esAdmin) && <Menu.ResourceItem name="regiones" aria-current={paginaActual("/regiones")} />}
                {(esAdmin || esCoordinador) && <Menu.ResourceItem name="estados" aria-current={paginaActual("/estados")} />}
                {(esAdmin || esCoordinador) && <Menu.ResourceItem name="ebdis" aria-current={paginaActual("/ebdis")} />}
            </Menu>
        </Box>
    );
}
