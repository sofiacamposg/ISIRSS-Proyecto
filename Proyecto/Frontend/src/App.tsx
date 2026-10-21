import { Admin, Resource, defaultTheme } from "react-admin";
import Dashboard from "./pages/Dashboard";
import { authProvider } from "./pages/AuthProvider";
import { dataProvider } from "./dataProvider";
import polyglotI18nProvider from "ra-i18n-polyglot";
import spanishMessages from "@blackbox-vision/ra-language-spanish";
import { TutoresList, TutoresCreate , TutoresShow} from "./pages/Tutores";
import { InfantesCreate, InfantesList, InfantesEdit, InfantesShow } from "./pages/Infantes";
import { MedicionesCreate, MedicionesList, MedicionesEdit, MedicionesShow } from "./pages/Mediciones";
import { SeguimientosCreate, SeguimientosEdit, SeguimientosList, SeguimientosShow } from "./pages/Seguimientos";
import { RegionesList, RegionesCreate, RegionesEdit, RegionesShow, EstadosList, EstadosCreate, EstadosEdit, EstadosShow, EBDIsList, EBDIsCreate, EBDIsEdit, EBDIsShow,} from "./pages/Catalogos";
import { CrecimientoPage } from "./pages/Crecimiento";
import { AlertasList } from "./pages/Alertas";
import { ReportesPage } from "./pages/Reportes";
import AppLayout from "./layout/AppLayout";

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

const tema = {
  ...defaultTheme, // copia del tema original, "..." (spread) copian propiedades de un objeto, los utilizamos para conservar todo lo del tema original y cambair solo la fuente
  palette: {
    ...defaultTheme.palette,
    background: {
      ...defaultTheme.palette?.background, // if palette exists, go to background
      default: "#f5f5f4",
    },
  },
  typography: {
    ...defaultTheme.typography, // copia de la tipografía original
    fontFamily: '"Noto Sans", Arial, Helvetica, sans-serif', // cambio de fuente a Noto Sans
  },
};

const i18nProvider = polyglotI18nProvider(() => spanishMessages, "es");

function App() {
  return (
    <Admin
      title="Plataforma de Crecimiento y Desarrollo Saludable"
      theme={tema}
      i18nProvider={i18nProvider}
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      layout={AppLayout}
    >
      <Resource
        name="tutores"
        list={TutoresList}
        create={TutoresCreate}
        show={TutoresShow}
        options={{ label: "Tutores" }}
      />
      <Resource
        name="infantes"
        list={InfantesList}
        create={InfantesCreate}
        edit={InfantesEdit}
        show={InfantesShow}
        options={{ label: "Infantes" }}
      />
      <Resource
        name="mediciones"
        list={MedicionesList}
        create={MedicionesCreate}
        edit={MedicionesEdit}
        show={MedicionesShow}
        options={{ label: "Mediciones" }}
      />
      <Resource
        name="seguimientos"
        options={{ label: "Seguimiento nutricional" }}
        list={SeguimientosList}
        create={SeguimientosCreate}
        show={SeguimientosShow}
        edit={SeguimientosEdit}
      />
      <Resource
        name="crecimiento"
        options={{ label: "Gráficas de crecimiento" }}
        list={CrecimientoPage}
      />
      <Resource
        name="alertas"
        list={AlertasList}
        options={{ label: "Alertas" }}
      />
      <Resource
        name="reportes"
        list={ReportesPage}
        options={{ label: "Reportes" }}
      />
      <Resource
        name="regiones"
        list={RegionesList}
        create={RegionesCreate}
        edit={RegionesEdit}
        show={RegionesShow}
        options={{ label: "Regiones" }}
      />
      <Resource
        name="estados"
        list={EstadosList}
        create={EstadosCreate}
        edit={EstadosEdit}
        show={EstadosShow}
        options={{ label: "Estados" }}
      />
      <Resource
        name="ebdis"
        list={EBDIsList}
        create={EBDIsCreate}
        edit={EBDIsEdit}
        show={EBDIsShow}
        options={{ label: "EBDI" }}
      />
    </Admin>
  );
}

export default App;