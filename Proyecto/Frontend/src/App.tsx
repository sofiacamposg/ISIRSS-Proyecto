import { Admin, Resource } from "react-admin";
import Dashboard from "./pages/Dashboard";
import { authProvider } from "./pages/AuthProvider";
import { dataProvider } from "./dataProvider";
import { InfantesList } from "./pages/Infantes";
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
        options={{ label: "Infantes" }}
      />
    </Admin>
  );
}

export default App;