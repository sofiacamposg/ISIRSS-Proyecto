import { Admin, Resource } from "react-admin";
import Dashboard from "./pages/Dashboard";
import { authProvider } from "./pages/AuthProvider";
import { dataProvider } from "./dataProvider";
import { InfantesCreate, InfantesList, InfantesEdit, InfantesShow } from "./pages/Infantes";
import { MedicionesCreate, MedicionesList, MedicionesEdit, MedicionesShow } from "./pages/Mediciones";
import { SeguimientosCreate, SeguimientosEdit, SeguimientosList, SeguimientosShow } from "./pages/Seguimientos";
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
    </Admin>
  );
}

export default App;