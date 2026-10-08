import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
//import { AuthProvider } from "./pages/AuthProvider";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">

        <main className="content">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;