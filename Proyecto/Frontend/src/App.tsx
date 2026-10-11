import { Admin, Resource } from "react-admin";
import Dashboard from "./pages/Dashboard";
import { authProvider } from "./pages/AuthProvider";
import { dataProvider } from "./dataProvider";
import { InfantesCreate, InfantesList, InfantesEdit, InfantesShow } from "./pages/Infantes";
import { MedicionesCreate, MedicionesList, MedicionesEdit, MedicionesShow } from "./pages/Mediciones";
import { SeguimientosCreate, SeguimientosEdit, SeguimientosList, SeguimientosShow } from "./pages/Seguimientos";
import { RegionesList, RegionesCreate, RegionesEdit, RegionesShow, EstadosList, EstadosCreate, EstadosEdit, EstadosShow, EBDIsList, EBDIsCreate, EBDIsEdit, EBDIsShow,} from "./pages/Catalogos";
import { CrecimientoPage } from "./pages/Crecimiento";
import { AlertasList } from "./pages/Alertas";
import { ReportesPage } from "./pages/Reportes";
import AppLayout from "./layout/AppLayout";


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