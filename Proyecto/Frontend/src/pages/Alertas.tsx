import { List, Datagrid, TextField, ReferenceField, FunctionField,} from "react-admin";

export const AlertasList = () => (
  <List title="Alertas de medición" sort={{ field: "diasDesdeUltimaMedicion", order: "DESC" }} perPage={25} >
    <Datagrid bulkActionButtons={false} rowClick={false}>
      <ReferenceField label="Infante" source="id_infante" reference="infantes" link="show" >
        <TextField source="nombre_completo" />
      </ReferenceField>
      <FunctionField label="Última medición" render={(record) => record?.ultimaMedicion || "Sin mediciones" } />
      <FunctionField label="Días transcurridos" render={(record) => record?.diasDesdeUltimaMedicion == null ? "No disponible" : record.diasDesdeUltimaMedicion } />
      <TextField source="estadoSeguimiento" label="Estado de medición" />
      <FunctionField label="Motivo" render={(record) => !record?.ultimaMedicion ? "No hay mediciones registradas" : `Han transcurrido ${record.diasDesdeUltimaMedicion} días desde la última medición` } />
    </Datagrid>
  </List>
);