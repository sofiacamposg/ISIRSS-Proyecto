import {List, Datagrid, TextField, DateField, NumberField, FunctionField, Create, SimpleForm, TextInput, DateInput, SelectInput, required, Show, SimpleShowLayout, Edit, ShowButton, EditButton, TopToolbar, ListButton, ReferenceManyField,} from "react-admin";

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
        <FunctionField label="Última medición" render={(record) => record.ultimaMedicion || "Sin registro"} />
        <FunctionField label="Días transcurridos" render={(record) => record.diasDesdeUltimaMedicion ?? "__"} />
        <FunctionField label="Estado de seguimiento" render={(record) => record.estadoSeguimiento} />
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
        <ReferenceManyField reference="mediciones" target="infanteId" label="Historial de crecimiento" sort={{ field: "fecha", order: "DESC" }} perPage={100} >
          <Datagrid bulkActionButtons={false}>
            <DateField source="fecha" label="Fecha" />
            <FunctionField label="Edad en la medición" render={(record) => record.edadEnMedicion} />
            <NumberField source="pesoKg" label="Peso (kg)" />
            <NumberField source="tallaCm" label="Talla (cm)" />
            <NumberField source="perimetroCefalicoCm" label="Perímetro cefálico (cm)" />
            <TextField source="observaciones" label="Observaciones" />
          </Datagrid>
        </ReferenceManyField>
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