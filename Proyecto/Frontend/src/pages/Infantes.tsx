import {List, Datagrid, TextField, DateField, Create, SimpleForm, TextInput, DateInput, SelectInput, required, Show, SimpleShowLayout, Edit, ShowButton, EditButton, TopToolbar, ListButton,} from "react-admin";

export function InfantesList() {
  return (
    <List title="Infantes registrados">
      <Datagrid rowClick="show">
        <TextField source="id" label="ID" />
        <TextField source="nombre" label="Nombre completo" />
        <DateField source="fechaNacimiento" label="Fecha de nacimiento" />
        <TextField source="sexo" label="Sexo" />
        <TextField source="unidadAtencion" label="Unidad de atención" />
        <TextField source="tutor" label="Padre, madre o tutor" />
        <EditButton label="Editar" />
        <ShowButton label="Ver ficha" />
      </Datagrid>
    </List>
  );
}

export function InfantesCreate() {
  return (
    <Create title="Registrar infante">
      <SimpleForm>
        <TextInput source="nombre" label="Nombre completo" validate={required()} fullWidth />
        <DateInput source="fechaNacimiento" label="Fecha de nacimiento" validate={required()} />
        <SelectInput source="sexo" label="Sexo"
          choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
          ]}
          validate={required()}
        />
        <TextInput source="unidadAtencion" label="Unidad de atención" validate={required()} fullWidth />
        <TextInput source="tutor" label="Nombre del padre, madre o tutor" validate={required()} fullWidth />
      </SimpleForm>
    </Create>
  );
}

export function InfantesShow() {
  return (
    <Show title="Ficha del infante">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="nombre" label="Nombre completo" />
        <DateField source="fechaNacimiento" label="Fecha de nacimiento" />
        <TextField source="sexo" label="Sexo" />
        <TextField source="unidadAtencion" label="Unidad de atención" />
        <TextField source="tutor" label="Padre, madre o tutor" />
      </SimpleShowLayout>
    </Show>
  );
}

export function InfantesEdit() {
  return (
    <Edit title="Editar infante">
      <SimpleForm>
        <TextInput source="nombre" label="Nombre completo" validate={required()} fullWidth />
        <DateInput source="fechaNacimiento" label="Fecha de nacimiento" validate={required()} />
        <SelectInput source="sexo" label="Sexo"
          choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
          ]}
          validate={required()}
        />
        <TextInput source="unidadAtencion" label="Unidad de atención" validate={required()} fullWidth />
        <TextInput source="tutor" label="Padre, madre o tutor" validate={required()} fullWidth />
      </SimpleForm>
    </Edit>
  );
}