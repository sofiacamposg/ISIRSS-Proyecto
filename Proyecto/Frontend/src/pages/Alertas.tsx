
import { List, Datagrid, TextField, DateField, SelectField } from "react-admin";

const tiposAlerta = [
    { id: "indicador", name: "Indicador de crecimiento" },
    { id: "medicion_pendiente", name: "Medición pendiente" },
];

const estadosAlerta = [
    { id: "pendiente", name: "Pendiente" },
    { id: "atendida", name: "Atendida" },
    { id: "descartada", name: "Descartada" },
];

export const AlertasList = () => (
    <List title="Alertas de medición" sort={{ field: "creada_en", order: "DESC" }} perPage={25}>
        <Datagrid bulkActionButtons={false} rowClick={false} >
            <TextField source="id_alerta" label="ID" />
            <TextField source="nombre_completo" label="Infante" />
            <SelectField source="tipo" label="Tipo de alerta" choices={tiposAlerta} />
            <TextField source="mensaje" label="Mensaje" />
            <SelectField source="estado" label="Estado" choices={estadosAlerta} />
            <DateField source="creada_en" label="Fecha de creación" showTime />
        </Datagrid>
    </List>
);
