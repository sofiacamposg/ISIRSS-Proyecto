import {List, Datagrid, TextField, DateField, ReferenceField, ReferenceInput, SelectInput, TextInput, DateInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton} from "react-admin";

export function CondicionesList() {
    return (
        <List title="Condiciones de salud">
            <Datagrid>
                <TextField source="id_condicion" label="ID" />
                <ReferenceField source="id_infante" reference="infantes" label="Infante">
                    <TextField source="nombre_completo" />
                </ReferenceField>
                <DateField source="fecha_registro" label="Fecha de registro"/>
                <TextField source="descripcion" label="Descripción" />
                <ShowButton />
                <EditButton />
            </Datagrid>
        </List>
    );
}

export function CondicionesCreate() {
    return (
        <Create title="Registrar condición de salud">
            <SimpleForm>
                <ReferenceInput source="id_infante" reference="infantes" label="Infante">
                    <SelectInput optionText="nombre_completo" validate={required()}/>
                </ReferenceInput>
                <DateInput source="fecha_registro" label="Fecha de registro" validate={required()}/>
                <TextInput source="descripcion" label="Descripción" multiline fullWidth validate={required()}/>
            </SimpleForm>
        </Create>
    );
}

export function CondicionesShow() {
    return (
        <Show title="Detalle de la condición">
            <SimpleShowLayout>
                <TextField source="id_condicion" label="ID" />
                <ReferenceField source="id_infante" reference="infantes"label="Infante">
                    <TextField source="nombre_completo" />
                </ReferenceField>
                <DateField source="fecha_registro" label="Fecha de registro"/>
                <TextField source="descripcion" label="Descripción" />
                <TextField source="registrado_por" label="Registrado por (ID de usuario)"/>
            </SimpleShowLayout>
        </Show>
    );
}

export function CondicionesEdit() {
    return (
        <Edit title="Editar condición de salud">
            <SimpleForm>
                <ReferenceField source="id_infante" reference="infantes" label="Infante">
                    <TextField source="nombre_completo" />
                </ReferenceField>
                <DateInput source="fecha_registro" label="Fecha de registro"  validate={required()}/>
                <TextInput source="descripcion" label="Descripción" multiline fullWidth validate={required()}/>
            </SimpleForm>
        </Edit>
    );
}