import logo_mex from '../assets/Logo_mex.png'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img 
          src={logo_mex}
        />
      </div>

      <nav className="sidebar-nav">

        <div className="nav-section">
          <span className="nav-title">PRINCIPAL</span>

          <a href="#" className="nav-item active">
            Dashboard
          </a>

          <a href="#" className="nav-item">
            Infantes
          </a>

          <a href="#" className="nav-item">
            Seguimiento
          </a>
        </div>

        <div className="nav-section">
          <span className="nav-title">GESTIÓN</span>

          <a href="#" className="nav-item">
            Mediciones
          </a>

          <a href="#" className="nav-item">
            Reportes
          </a>

          <a href="#" className="nav-item">
            Alertas
          </a>
        </div>

        <div className="nav-section">
          <span className="nav-title">ADMINISTRACIÓN</span>

          <a href="#" className="nav-item">
            Configuración
          </a>
        </div>

      </nav>  
    </aside>
  );
}

export default Sidebar;