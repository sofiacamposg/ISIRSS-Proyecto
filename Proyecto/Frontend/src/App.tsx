import { Admin, Resource, defaultTheme, defaultDarkTheme } from "react-admin";
import Dashboard from "./pages/Dashboard";
import { authProvider } from "./pages/AuthProvider";
import { dataProvider } from "./dataProvider";
import polyglotI18nProvider from "ra-i18n-polyglot";
import spanishMessages from "@blackbox-vision/ra-language-spanish";
import { TutoresList, TutoresCreate , TutoresShow} from "./pages/Tutores";
import { InfantesCreate, InfantesList, InfantesEdit, InfantesShow } from "./pages/Infantes";
import { MedicionesCreate, MedicionesList, MedicionesEdit, MedicionesShow } from "./pages/Mediciones";
import { SeguimientosCreate, SeguimientosEdit, SeguimientosList, SeguimientosShow } from "./pages/Seguimientos";
import { CondicionesList, CondicionesShow, CondicionesCreate, CondicionesEdit} from "./pages/Condiciones";
import { AccionesList, AccionesShow, AccionesCreate, AccionesEdit} from "./pages/Acciones";
import { RegionesList, RegionesCreate, RegionesEdit, RegionesShow, EstadosList, EstadosCreate, EstadosEdit, EstadosShow, EBDIsList, EBDIsCreate, EBDIsEdit, EBDIsShow,} from "./pages/Catalogos";
import { CrecimientoPage } from "./pages/Crecimiento";
import { AlertasList } from "./pages/Alertas";
import { ReportesPage } from "./pages/Reportes";
import { UsuariosList, UsuarioCreate, UsuarioEdit } from "./pages/Usuarios";
import { AutorizacionesList } from "./pages/Authorizaciones";
import AppLayout from "./layout/AppLayout";
//Imports para los links del Footer
import { CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import AvisoPrivacidad from "./pages/AvisoPrivacidad";
import Ayuda from "./pages/Ayuda";
//Login
import Login from "./pages/Login";
//íconos
import {
  PeopleOutline,
  StraightenOutlined,
  AssignmentOutlined,
  ShowChartOutlined,
  NotificationsNoneOutlined,
  DescriptionOutlined,
  BadgeOutlined,
  MapOutlined,
  FlagOutlined,
  ApartmentOutlined,
  FavoriteBorderOutlined,
  PlaylistAddCheckOutlined,
  ManageAccountsOutlined,
} from "@mui/icons-material";

import type { ThemeOptions } from "@mui/material";
import { borderRadius } from "@mui/system";

const accessControlProvider = {
  canAccess: async ({ resource, action }: { resource?: string; action: string }) => {
    const role = localStorage.getItem("userRole");
    if (role === "administrador") return true;
    const lectura = ["list", "show", "export"];
    const recursosOperativos = ["infantes", "mediciones", "seguimientos"];
    const recursosConsulta = [...recursosOperativos, "crecimiento", "alertas", "reportes", "regiones", "estados", "ebdis"];
    if (role === "coordinador_regional") {
      return recursosConsulta.includes(resource ?? "") && lectura.includes(action);
    }
    if (role === "estancia") {
      if (recursosOperativos.includes(resource ?? "")) return [...lectura, "create", "edit"].includes(action);
      return ["crecimiento", "alertas", "reportes"].includes(resource ?? "") && lectura.includes(action);
    }
    if (role === "tutor") {
      return ["infantes", "mediciones", "seguimientos", "crecimiento", "alertas"].includes(resource ?? "") && lectura.includes(action);
    }
    return false;
  },
};

// Paleta oficial (mismos colores que en index.css)
const colores = {
  guinda: "#611232",
  blanco: "#ffffff",
  grisFondo: "#f5f5f4",
};

const tema: ThemeOptions = {
  palette: {
    primary: {
      main: colores.guinda, // color principal: enlaces, botones, checkboxes
    },
    background: {
      default: colores.grisFondo,
    },
  },
  typography: {
    fontFamily: '"Noto Sans", Arial, Helvetica, sans-serif', // fuente oficial
  },
  components: {
    RaLayout: {
      styleOverrides: {
        root: {
          // La barra es sticky, así que no hace falta el margen de arriba
          "& .RaLayout-appFrame": { marginTop: 0 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#808080",
        },
      },
    },
    RaSkipNavigationButton: {
      styleOverrides: {
        root: {
          backgroundColor: colores.guinda,
          color: colores.blanco,
        },
      },
    },
  },
};

const i18nProvider = polyglotI18nProvider(() => spanishMessages, "es");

function App() {
  return (
    <Admin
      title="Plataforma de Crecimiento y Desarrollo Saludable"
      theme={tema}
      darkTheme={null} //Solo es para que no se ponga por default darktheme en lugar de los colores que dice en Login.tsx 
      i18nProvider={i18nProvider}
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={Login}
      dashboard={Dashboard}
      layout={AppLayout}
    >
  
      <CustomRoutes>
        <Route
          path="/preguntas-frecuentes"
          element={<PreguntasFrecuentes />}
        />
        <Route
          path="/aviso-de-privacidad"
          element={<AvisoPrivacidad />}
        />
        <Route
          path="/ayuda"
          element={<Ayuda />}
        />
      </CustomRoutes>

      <Resource
        name="infantes"
        list={InfantesList}
        create={InfantesCreate}
        edit={InfantesEdit}
        show={InfantesShow}
        options={{ label: "Infantes" }}
        icon={PeopleOutline}
      />

      <Resource
        name="mediciones"
        list={MedicionesList}
        create={MedicionesCreate}
        edit={MedicionesEdit}
        show={MedicionesShow}
        options={{ label: "Mediciones" }}
        icon={StraightenOutlined}
      />

      <Resource
        name="seguimientos"
        options={{ label: "Seguimiento nutricional" }}
        list={SeguimientosList}
        create={SeguimientosCreate}
        show={SeguimientosShow}
        edit={SeguimientosEdit}
        icon={AssignmentOutlined}
      />

      <Resource
        name="condiciones"
        options={{ label: "Condiciones de salud" }}
        list={CondicionesList}
        create={CondicionesCreate}
        show={CondicionesShow}
        edit={CondicionesEdit}
        icon={FavoriteBorderOutlined}
      />
      <Resource
        name="acciones_seguimiento"
        options={{ label: "Acciones Seguimientos" }}
        list={AccionesList}
        create={AccionesCreate}
        show={AccionesShow}
        edit={AccionesEdit}
        icon={PlaylistAddCheckOutlined}
      />
      <Resource
        name="crecimiento"
        options={{ label: "Gráficas de crecimiento" }}
        list={CrecimientoPage}
        icon={ShowChartOutlined}
      />

      <Resource
        name="alertas"
        list={AlertasList}
        options={{ label: "Alertas" }}
        icon={NotificationsNoneOutlined}
      />

      <Resource
        name="reportes"
        list={ReportesPage}
        options={{ label: "Reportes" }}
        icon={DescriptionOutlined}
      />

      <Resource
        name="tutores"
        list={TutoresList}
        create={TutoresCreate}
        show={TutoresShow}
        options={{ label: "Tutores" }}
        icon={BadgeOutlined}
      />

      <Resource
        name="infante_tutor"
        list={AutorizacionesList}
        options={{ label: "Autorizaciones" }}
      />

      <Resource
        name="regiones"
        list={RegionesList}
        create={RegionesCreate}
        edit={RegionesEdit}
        show={RegionesShow}
        options={{ label: "Regiones" }}
        icon={MapOutlined}
      />

      <Resource
        name="estados"
        list={EstadosList}
        create={EstadosCreate}
        edit={EstadosEdit}
        show={EstadosShow}
        options={{ label: "Estados" }}
        icon={FlagOutlined}
      />

      <Resource
        name="ebdis"
        list={EBDIsList}
        create={EBDIsCreate}
        edit={EBDIsEdit}
        show={EBDIsShow}
        options={{ label: "EBDI" }}
        icon={ApartmentOutlined}
      />
      <Resource
        name="usuarios"
        list={UsuariosList}
        create={UsuarioCreate}
        edit={UsuarioEdit}
        icon={ManageAccountsOutlined}
      />
    </Admin>
  );
}

export default App;