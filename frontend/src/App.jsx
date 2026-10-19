import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>ISIRSS</h1>

          <p className="subtitle">
            Plataforma de Crecimiento y Desarrollo Saludable
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo electrónico</label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>

              <input
                type="password"
                placeholder="••••••••"
              />
            </div>

            <button type="submit">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          ISIRSS
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            Dashboard
          </button>

          <button className="nav-item">
            Padrón infantil
          </button>

          <button className="nav-item">
            Seguimiento
          </button>

          <button className="nav-item">
            Reportes
          </button>

          <button className="nav-item">
            Usuarios
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={() => setLoggedIn(false)}
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Resumen general del sistema</p>
          </div>

          <div className="user-info">
            Administrador
          </div>
        </header>

        <section className="dashboard-cards">
          <div className="stat-card">
            <span className="stat-number">245</span>
            <span className="stat-label">
              Infantes activos
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">18</span>
            <span className="stat-label">
              Mediciones pendientes
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">7</span>
            <span className="stat-label">
              Casos en seguimiento
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">12</span>
            <span className="stat-label">
              Alertas activas
            </span>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <h3>Mediciones pendientes</h3>

            <p>
              Aquí mostraremos los infantes que necesitan una nueva medición.
            </p>
          </div>

          <div className="panel">
            <h3>Casos en seguimiento</h3>

            <p>
              Aquí mostraremos los casos que requieren atención.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;