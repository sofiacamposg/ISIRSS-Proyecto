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
        <ReferenceField source="id_infante" reference="infantes" label="Infante" >
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_apertura" label="Fecha" />
        <TextField source="motivo" label="Motivo" />
        <TextField source="responsable_nombre" label="Responsable" />
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
        <ReferenceInput
          source="id_infante"
          reference="infantes"
          label="Infante"
        >
          <SelectInput
            optionText="nombre_completo"
            validate={required()}
            fullWidth
          />
        </ReferenceInput>

        <ReferenceInput
          source="id_condicion"
          reference="condiciones"
          label="Condición de salud"
        >
          <SelectInput
            optionText="nombre"
            fullWidth
          />
        </ReferenceInput>

        <DateInput
          source="fecha_apertura"
          label="Fecha de apertura"
          validate={required()}
        />

        <TextInput
          source="motivo"
          label="Motivo del seguimiento"
          validate={required()}
          multiline
          fullWidth
        />

        <SelectInput
          source="estado"
          label="Estado del seguimiento"
          choices={[
            { id: "requiere_seguimiento", name: "Requiere seguimiento" },
            { id: "en_seguimiento", name: "En seguimiento" },
            { id: "concluido", name: "Concluido" },
          ]}
          defaultValue="requiere_seguimiento"
          validate={required()}
          fullWidth
        />
        <TextInput
          source="responsable_nombre"
          label="Responsable"
          validate={required()}
          fullWidth
        />

        <TextInput
            source="observaciones"
            label="Observaciones"
            multiline
            minRows={3}
            fullWidth
        />

        <TextInput
            source="acciones_realizadas"
            label="Acciones realizadas o programadas"
            validate={required()}
            multiline
            minRows={3}
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
        <ReferenceField source="id_infante" reference="infantes" label="Infante" >
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_apertura" label="Fecha" />
        <TextField source="motivo" label="Motivo" />
        <TextField source="observaciones" label="Observaciones" />
        <TextField source="acciones_realizadas" label="Acciones" />
        <TextField source="responsable_nombre" label="Responsable" />
        <TextField source="estado" label="Estado" />
      </SimpleShowLayout>
    </Show>
  );
}

export function SeguimientosEdit() {
  return (
    <Edit title="Editar seguimiento">
      <SimpleForm>
        <ReferenceInput source="id_infante" reference="infantes" label="Infante" >
          <SelectInput optionText="nombre_completo" validate={required()} fullWidth />
        </ReferenceInput>
        <DateInput source="fecha_apertura" label="Fecha del seguimiento" validate={required()} />
        <TextInput source="motivo" label="Motivo del seguimiento" validate={required()} fullWidth />
        <TextInput source="observaciones" label="Observaciones" multiline minRows={3} fullWidth />
        <TextInput source="acciones_realizadas" label="Acciones realizadas o programadas" multiline minRows={3} fullWidth />
        <TextInput source="responsable_nombre" label="Responsable" validate={required()} fullWidth />
        <SelectInput source="estado" label="Estado del seguimiento" choices={estadosSeguimiento} validate={required()} fullWidth />
      </SimpleForm>
    </Edit>
  );
}