import { Menu, Sidebar, usePermissions, useSidebarState, type SidebarProps } from "react-admin";
import { ListSubheader } from "@mui/material";
import { HomeOutlined, List } from "@mui/icons-material";
import { minHeight } from "@mui/system";
import type { ReactNode } from "react";

// Estilos de los elementos del menú, texto e íconos blancos
const estilosMenu = {
    // cada elemento del menú, texto blanco y altura mínima
    "& .RaMenuItemLink-root": {
        color: "common.white",
        minHeight: 44,
        borderRadius: 2,
        mx: 1,
    },

    // íconos blancos separado para que funcione bien
    "& .RaMenuItemLink-root .RaMenuItemLink-icon": {
        color: "common.white",
    },
    // hover blanco con opacidad
    "& .RaMenuItemLink-root:hover": {
        backgroundColor: "#ffffff1f",
    },
    // página actual: fondo blanco, texto e ícono guinda en negrita
    "& .RaMenuItemLink-root.RaMenuItemLink-active": {
        color: "primary.main",
        backgroundColor: "white", // verde oscuro oficial (14.58:1 con blanco)
        fontWeight: 700,
    },
    // ícono guinda separado para que funcione bien
    "& .RaMenuItemLink-root.RaMenuItemLink-active .RaMenuItemLink-icon": {
        color: "primary.main",           // ícono guinda
    },
}

// Panel lateral con fondo guinda
export function BarraLateral(props: SidebarProps) {
    return (
        <Sidebar
            {...props} // todas las propiedades que React-Admin le pasa al panel
            sx={{
                "& .MuiPaper-root": { backgroundColor: "primary.main" },
                "& .RaSidebar-fixed": { backgroundColor: "primary.main" }
            }}
        />
    );
}

// Categorías del menú, solo son visibles con el menú abierto

function Categoria({children}: {children: ReactNode}) {
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
    if (isLoading) return <Menu sx={estilosMenu} />;

    const role = String(permissions ?? "");
    const esAdmin = role === "administrador";
    const esEstancia = role === "estancia";
    const esCoordinador = role === "coordinador_regional";
    const esTutor = role === "tutor";

    return (
        <Menu sx={estilosMenu}>
            <Categoria>Principal</Categoria>
            <Menu.Item to="/" primaryText="Inicio" leftIcon={<HomeOutlined />} />
            {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="infantes" />}
            {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="mediciones" />}
            {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="seguimientos" options={{ label: "Seguimiento nutricional" }} />}
            {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="crecimiento" />}

            {(esAdmin || esEstancia || esCoordinador) && <Categoria>Gestión</Categoria>}
            {(esAdmin || esEstancia || esCoordinador || esTutor) && <Menu.ResourceItem name="alertas" />}
            {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="reportes" />}
            {(esAdmin || esEstancia || esCoordinador) && <Menu.ResourceItem name="tutores" />}

            {(esAdmin || esCoordinador) && <Categoria>Catálogos</Categoria>}
            {(esAdmin || esCoordinador) && <Menu.ResourceItem name="regiones" />}
            {(esAdmin || esCoordinador) && <Menu.ResourceItem name="estados" />}
            {(esAdmin || esCoordinador) && <Menu.ResourceItem name="ebdis" />}
        </Menu>
    );
}
