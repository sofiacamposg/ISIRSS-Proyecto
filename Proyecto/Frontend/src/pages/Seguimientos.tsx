import {List, Datagrid, TextField, DateField, ReferenceField, ReferenceInput, SelectInput, TextInput, DateInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton, FormDataConsumer, SelectField} from "react-admin";

// Opciones de estado utilizadas en los formularios.
const estadosSeguimiento = [
    { id: "requiere_seguimiento", name: "Requiere seguimiento" },
    { id: "en_seguimiento", name: "En seguimiento" },
    { id: "concluido", name: "Seguimiento concluido" },
];

const seguimientosFilters = [
    <ReferenceInput key="id_infante" source="id_infante" reference="infantes" label="Infante" >
        <SelectInput optionText="nombre_completo" emptyText="Todos los infantes"/>
    </ReferenceInput>,
    <DateInput key="fecha_apertura" source="fecha_apertura" label="Fecha de apertura" />,
    <TextInput key="motivo" source="motivo" label="Motivo" />,
    <SelectInput key="estado" source="estado" label="Estado" choices={estadosSeguimiento} emptyText="Todos los estados" alwaysOn/>,
];

export function SeguimientosList() {
  return (
    <List title="Seguimiento nutricional" filters={seguimientosFilters}>
      <Datagrid rowClick="show">
        <TextField source="id" label="ID" />
        <ReferenceField source="id_infante" reference="infantes" label="Infante">
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_apertura" label="Fecha de apertura" />
        <TextField source="motivo" label="Motivo" />
        <SelectField source="estado" label="Estado" choices={estadosSeguimiento} />
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
        <ReferenceInput source="id_infante" reference="infantes" label="Infante">
          <SelectInput optionText="nombre_completo" validate={required()} fullWidth />
        </ReferenceInput>
        <FormDataConsumer>
          {({ formData }) => formData.id_infante ? (
            <ReferenceInput source="id_condicion" reference="condiciones" label="Condición de salud" filter={{ id_infante: formData.id_infante }}>
              <SelectInput optionText="descripcion" fullWidth/>
            </ReferenceInput>
          ) : (
            <SelectInput source="id_condicion" label="Condición de salud" choices={[]} disabled fullWidth/>
          )}
        </FormDataConsumer>
        <DateInput source="fecha_apertura" label="Fecha de apertura" validate={required()}/>
        <TextInput source="motivo" label="Motivo del seguimiento" validate={required()} multiline fullWidth/>
        <SelectInput
          source="estado"
          label="Estado del seguimiento"
          choices={estadosSeguimiento.filter(
            (estado) => estado.id !== "concluido"
          )}
          defaultValue="requiere_seguimiento"
          validate={required()}
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
}

export function SeguimientosShow() {
  return (
    <Show title="Detalle del seguimiento">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <ReferenceField source="id_infante" reference="infantes" label="Infante">
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_apertura" label="Fecha de apertura" />
        <TextField source="motivo" label="Motivo" />
        <SelectField source="estado" label="Estado" choices={estadosSeguimiento} />
        <DateField source="fecha_cierre" label="Fecha de cierre" />
      </SimpleShowLayout>
    </Show>
  );
}

export function SeguimientosEdit() {
  return (
    <Edit title="Editar seguimiento">
      <SimpleForm>
        <ReferenceInput source="id_infante" reference="infantes" label="Infante">
          <SelectInput optionText="nombre_completo" validate={required()} fullWidth />
        </ReferenceInput>
        <FormDataConsumer>
          {({ formData }) => formData.id_infante ? (
            <ReferenceInput source="id_condicion" reference="condiciones" label="Condición de salud" filter={{ id_infante: formData.id_infante }}>
              <SelectInput optionText="descripcion" fullWidth/>
            </ReferenceInput>
          ) : (
            <SelectInput source="id_condicion" label="Condición de salud" choices={[]} disabled fullWidth/>
          )}
        </FormDataConsumer>
        <DateInput source="fecha_apertura" label="Fecha de apertura" validate={required()}/>
        <TextInput source="motivo" label="Motivo del seguimiento" validate={required()} multiline fullWidth/>
        <SelectInput
          source="estado"
          label="Estado del seguimiento"
          choices={estadosSeguimiento}
          validate={required()}
          fullWidth
        />
        <FormDataConsumer>
          {({ formData }) =>
            formData.estado === "concluido" ? (
              <DateInput source="fecha_cierre" label="Fecha de cierre" validate={required()}/>
            ) : null
          }
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  );
}