import { List, Datagrid, TextField } from "react-admin";

export function InfantesList() {
  return (
    <List>
      <Datagrid>
        <TextField source="id" />
        <TextField source="nombre" />
      </Datagrid>
    </List>
  );
}