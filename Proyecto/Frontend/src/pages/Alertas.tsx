
import {
    List,
    Datagrid,
    TextField,
    DateField,
} from "react-admin";

export const AlertasList = () => (
    <List title="Alertas de medición" sort={{ field: "creada_en", order: "DESC" }} perPage={25}>
        <Datagrid bulkActionButtons={false} rowClick={false} >
            <TextField source="id_alerta" label="ID" />
            <TextField source="nombre_completo" label="Infante" />
            <TextField source="tipo" label="Tipo de alerta" />
            <TextField source="mensaje" label="Mensaje" />
            <TextField source="estado" label="Estado" />
            <DateField source="creada_en" label="Fecha de creación" showTime />
        </Datagrid>
    </List>
);
