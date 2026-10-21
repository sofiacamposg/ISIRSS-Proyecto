import { Admin, Resource } from "react-admin";
import Dashboard from "./pages/Dashboard";
import { authProvider } from "./pages/AuthProvider";
import { dataProvider } from "./dataProvider";
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

function App() {
  return (
    <Admin
      title="Plataforma de Crecimiento y Desarrollo Saludable"
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
        name="condiciones"
        options={{ label: "Condiciones de salud" }}
        list={CondicionesList}
        create={CondicionesCreate}
        show={CondicionesShow}
        edit={CondicionesEdit}
      />
      <Resource
        name="acciones_seguimiento"
        options={{ label: "Acciones Seguimientos" }}
        list={AccionesList}
        create={AccionesCreate}
        show={AccionesShow}
        edit={AccionesEdit}
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