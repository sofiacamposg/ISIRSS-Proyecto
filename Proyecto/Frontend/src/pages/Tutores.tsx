import {List, Datagrid, TextField, EmailField, Create, SimpleForm, TextInput, required, Show, SimpleShowLayout} from "react-admin";

export function TutoresList() {
    return (
        <List title="Tutores">
            <Datagrid rowClick="show">
                <TextField source="id_tutor" label="ID" />
                <TextField source="nombre_tutor" label="Nombre" />
                <TextField source="telefono" label="Teléfono" />
                <EmailField source="correo" label="Correo" />
            </Datagrid>
        </List>
    );
}

export function TutoresCreate() {
    return (
        <Create title="Registrar tutor">
            <SimpleForm>
                <TextInput source="nombre" label="Nombre completo" validate={required()} fullWidth/>
                <TextInput source="telefono" label="Teléfono"/>
                <TextInput source="correo" label="Correo electrónico" type="email"/>
            </SimpleForm>
        </Create>
    );
}

export function TutoresShow() {
    return (
        <Show title="Infromación del tutor">
            <SimpleShowLayout>
                <TextField source="id_tutor" label="ID" />
                <TextField source="nombre_tutor" label="Nombre" />
                <TextField source="telefono" label="Teléfono" />
                <EmailField source="correo" label="Correo" />
            </SimpleShowLayout>
        </Show>
    );
}
