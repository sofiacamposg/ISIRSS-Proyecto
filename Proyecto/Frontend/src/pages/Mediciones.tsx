import {List, Datagrid, TextField, DateField, NumberField, ReferenceField, ReferenceInput, SelectInput, NumberInput, DateInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, } from "react-admin";

export function MedicionesList() {
  return (
    <List title="Mediciones de crecimiento">
      <Datagrid rowClick="show">
        <TextField source="id" label="ID" />
        <ReferenceField source="infanteId" reference="infantes" label="Infante" >
          <TextField source="nombre" />
        </ReferenceField>
        <DateField source="fecha" label="Fecha" />
        <NumberField source="pesoKg" label="Peso (kg)" />
        <NumberField source="tallaCm" label="Talla (cm)" />
      </Datagrid>
    </List>
  );
}

export function MedicionesCreate() {
  return (
    <Create title="Registrar medición">
      <SimpleForm>
        <ReferenceInput source="infanteId" reference="infantes" label="Infante" >
          <SelectInput optionText="nombre" validate={required()} fullWidth />
        </ReferenceInput>
        <DateInput source="fecha" label="Fecha de medición" validate={required()} />
        <NumberInput source="pesoKg" label="Peso (kg)" min={0} step={0.01} validate={required()} />
        <NumberInput source="tallaCm" label="Talla (cm)" min={0} step={0.1} validate={required()} />
      </SimpleForm>
    </Create>
  );
}

export function MedicionesShow() {
  return (
    <Show title="Detalle de medición">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <ReferenceField source="infanteId" reference="infantes" label="Infante" >
          <TextField source="nombre" />
        </ReferenceField>
        <DateField source="fecha" label="Fecha de medición" />
        <NumberField source="pesoKg" label="Peso (kg)" />
        <NumberField source="tallaCm" label="Talla (cm)" />
      </SimpleShowLayout>
    </Show>
  );
}

export function MedicionesEdit() {
  return (
    <Edit title="Editar medición">
      <SimpleForm>
        <ReferenceInput source="infanteId" reference="infantes" label="Infante" >
          <SelectInput optionText="nombre" validate={required()} fullWidth />
        </ReferenceInput>
        <DateInput source="fecha" label="Fecha de medición" validate={required()} />
        <NumberInput source="pesoKg" label="Peso (kg)" min={0} step={0.01} validate={required()} />
        <NumberInput source="tallaCm" label="Talla (cm)" min={0} step={0.1} validate={required()} />
      </SimpleForm>
    </Edit>
  );
}