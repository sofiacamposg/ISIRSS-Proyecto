import StatCard from "../components/Statcard";

function Dashboard() {
  console.log("MI DASHBOARD SE ESTA RENDERIZANDO");
  return (
    <div className="dashboard">

      <div className="welcome">

        <div>
          <span className="eyebrow">
            SISTEMA DE CONTROL INFANTIL
          </span>

          <h1>
            Bienvenido al sistema
            <span className="sr-only"> (texto de prueba oculto)</span>
          </h1>

          <p>
            Consulta y seguimiento de la información del padrón infantil.
          </p>
        </div>

        <div className="date">
          <span>Periodo actual</span>
          <strong>Septiembre 2026</strong>
        </div>

      </div>


      <section className="stats-grid">

        <StatCard
          title="Infantes registrados"
          value="1,248"
          description="En el padrón actual"
        />

        <StatCard
          title="Mediciones"
          value="3,842"
          description="Registros realizados"
        />

        <StatCard
          title="En seguimiento"
          value="37"
          description="Casos activos"
          type="warning"
        />

        <StatCard
          title="Alertas pendientes"
          value="14"
          description="Requieren revisión"
          type="danger"
        />

      </section>


      <section className="dashboard-grid">

        <div className="panel">

          <div className="panel-header">

            <div>
              <span className="eyebrow">
                PADRÓN
              </span>

              <h3>
                Infantes recientes
              </h3>
            </div>

            <button className="secondary-button">
              Ver todos
            </button>

          </div>


          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Infante</th>
                  <th>EBDI</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>INF-00124</td>
                  <td>María Fernanda López</td>
                  <td>EBDI 012</td>
                  <td>
                    <span className="status active-status">
                      Activo
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>INF-00125</td>
                  <td>Santiago Hernández</td>
                  <td>EBDI 008</td>
                  <td>
                    <span className="status active-status">
                      Activo
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>INF-00126</td>
                  <td>Valentina García</td>
                  <td>EBDI 015</td>
                  <td>
                    <span className="status follow-status">
                      Seguimiento
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>INF-00127</td>
                  <td>Mateo Ramírez</td>
                  <td>EBDI 004</td>
                  <td>
                    <span className="status active-status">
                      Activo
                    </span>
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;