import {
  List,
  Datagrid,
  TextField,
  EmailField,
  Create,
  SimpleForm,
  TextInput,
  required,
  email,
  regex,
  Show,
  SimpleShowLayout,
  ShowButton,
} from "react-admin";

// Validación del teléfono: exactamente 10 dígitos.
const validarTelefono = regex(
  /^[0-9]{10}$/,
  "El teléfono debe contener 10 dígitos."
);

export function TutoresList() {
  return (
    <List title="Tutores">
      <Datagrid rowClick="show">
        <TextField source="id_tutor" label="ID" />
        <TextField source="nombre_tutor" label="Nombre" />
        <TextField source="telefono" label="Teléfono" />
        <EmailField source="correo" label="Correo" />
        <ShowButton label="Ver ficha" />
      </Datagrid>
    </List>
  );
}

export function TutoresCreate() {
  return (
    <Create title="Registrar tutor">
      <SimpleForm>
        <TextInput
          source="nombre"
          label="Nombre completo"
          autoComplete="name"
          validate={required()}
          fullWidth
        />

        <TextInput
          source="telefono"
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          helperText="10 dígitos, ej. 5512345678"
          validate={validarTelefono}
          fullWidth
        />

        <TextInput
          source="correo"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          validate={email()}
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
}

export function TutoresShow() {
  return (
    <Show title="Información del tutor">
      <SimpleShowLayout>
        <TextField source="id_tutor" label="ID" />
        <TextField source="nombre_tutor" label="Nombre" />
        <TextField source="telefono" label="Teléfono" />
        <EmailField source="correo" label="Correo" />
      </SimpleShowLayout>
    </Show>
  );
}