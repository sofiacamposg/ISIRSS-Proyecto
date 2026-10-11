import {List, Datagrid, TextField, DateField, ReferenceField, ReferenceInput, SelectInput, TextInput, DateInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton,} from "react-admin";

const estadosSeguimiento = [
  { id: "Sin seguimiento", name: "Sin seguimiento" },
  { id: "Requiere seguimiento", name: "Requiere seguimiento" },
  { id: "En seguimiento", name: "En seguimiento" },
  { id: "Seguimiento concluido", name: "Seguimiento concluido" },
];

export function SeguimientosList() {
  return (
    <List title="Seguimiento nutricional">
      <Datagrid rowClick="show">
        <TextField source="id" label="ID" />
        <ReferenceField source="infanteId" reference="infantes" label="Infante" >
          <TextField source="nombre" />
        </ReferenceField>
        <DateField source="fecha" label="Fecha" />
        <TextField source="motivo" label="Motivo" />
        <TextField source="responsable" label="Responsable" />
        <TextField source="estado" label="Estado" />
        <ShowButton label="Ver caso" />
        <EditButton label="Editar" />
      </Datagrid>
    </List>
  );
}

export function SeguimientosCreate() {
  return (
    <Create title="Registrar seguimiento">
      <SimpleForm>
        <ReferenceInput source="infanteId" reference="infantes" label="Infante" >
          <SelectInput optionText="nombre" validate={required()} fullWidth />
        </ReferenceInput>
        <DateInput source="fecha" label="Fecha del seguimiento" validate={required()} />
        <TextInput source="motivo" label="Motivo del seguimiento" validate={required()} fullWidth />
        <TextInput source="observaciones" label="Observaciones" multiline minRows={3} fullWidth />
        <TextInput source="acciones" label="Acciones realizadas o programadas" multiline minRows={3} fullWidth />
        <TextInput source="responsable" label="Responsable" validate={required()} fullWidth />
        <SelectInput source="estado" label="Estado del seguimiento" choices={estadosSeguimiento} defaultValue="Requiere seguimiento" validate={required()} fullWidth />
      </SimpleForm>
    </Create>
  );
}

export function SeguimientosShow() {
  return (
    <Show title="Detalle del seguimiento">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <ReferenceField source="infanteId" reference="infantes" label="Infante" >
          <TextField source="nombre" />
        </ReferenceField>
        <DateField source="fecha" label="Fecha" />
        <TextField source="motivo" label="Motivo" />
        <TextField source="observaciones" label="Observaciones" />
        <TextField source="acciones" label="Acciones" />
        <TextField source="responsable" label="Responsable" />
        <TextField source="estado" label="Estado" />
      </SimpleShowLayout>
    </Show>
  );
}

export function SeguimientosEdit() {
  return (
    <Edit title="Editar seguimiento">
      <SimpleForm>
        <ReferenceInput source="infanteId" reference="infantes" label="Infante" >
          <SelectInput optionText="nombre" validate={required()} fullWidth />
        </ReferenceInput>
        <DateInput source="fecha" label="Fecha del seguimiento" validate={required()} />
        <TextInput source="motivo" label="Motivo del seguimiento" validate={required()} fullWidth />
        <TextInput source="observaciones" label="Observaciones" multiline minRows={3} fullWidth />
        <TextInput source="acciones" label="Acciones realizadas o programadas" multiline minRows={3} fullWidth />
        <TextInput source="responsable" label="Responsable" validate={required()} fullWidth />
        <SelectInput source="estado" label="Estado del seguimiento" choices={estadosSeguimiento} validate={required()} fullWidth />
      </SimpleForm>
    </Edit>
  );
}