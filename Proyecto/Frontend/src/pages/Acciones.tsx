import { List, Datagrid, TextField, ReferenceField, ReferenceInput, SelectInput, TextInput, DateTimeInput, NumberInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton, FormDataConsumer} from "react-admin";

export function AccionesList() {
    return (
        <List title="Acciones de seguimiento">
            <Datagrid>
                <TextField source="id_accion" label="ID" />
                <ReferenceField source="id_seguimiento" reference="seguimientos" label="Infante">
                    <ReferenceField source="id_infante" reference="infantes">
                        <TextField source="nombre_completo" />
                    </ReferenceField>
                </ReferenceField>
                <ReferenceField source="id_seguimiento" reference="seguimientos" label="Caso de seguimiento">
                    <TextField source="motivo" />
                </ReferenceField>
                <TextField source="fecha" label="Fecha y hora" />
                <TextField source="acciones_realizadas" label="Acciones realizadas" />
                <TextField source="responsable_nombre" label="Responsable" />
                <ShowButton />
                <EditButton />
            </Datagrid>
        </List>
    );
}

export function AccionesCreate() {
    return (
        <Create title="Registrar acción">
            <SimpleForm>
                <ReferenceInput source="id_infante" reference="infantes" label="Infante">
                    <SelectInput optionText="nombre_completo" validate={required()} fullWidth/>
                </ReferenceInput>
                <FormDataConsumer>
                    {({ formData }) => formData.id_infante ? (
                        <ReferenceInput source="id_seguimiento" reference="seguimientos" label="Caso de seguimiento" filter={{ id_infante: formData.id_infante }}>
                            <SelectInput optionText="motivo" validate={required()} fullWidth />
                        </ReferenceInput>
                    ) : (
                        <SelectInput source="id_seguimiento" label="Caso de seguimiento" choices={[]} disabled fullWidth/>
                    )}
                </FormDataConsumer>
                <DateTimeInput source="fecha" label="Fecha y hora" validate={required()} />
                <TextInput source="acciones_realizadas" label="Acciones realizadas" multiline fullWidth validate={required()} />
                <TextInput source="observaciones" label="Observaciones" multiline fullWidth />
                <TextInput source="responsable_nombre" label="Nombre del responsable" validate={required()} />
                <NumberInput source="responsable_usuario" label="ID de usuario responsable (opcional)" min={1} />
            </SimpleForm>
        </Create>
    );
}

export function AccionesShow() {
    return (
        <Show title="Detalle de la acción">
            <SimpleShowLayout>
                <TextField source="id_accion" label="ID" />
                <ReferenceField source="id_seguimiento" reference="seguimientos" label="Infante">
                    <ReferenceField source="id_infante" reference="infantes">
                        <TextField source="nombre_completo" />
                    </ReferenceField>
                </ReferenceField>
                <ReferenceField source="id_seguimiento" reference="seguimientos" label="Caso de seguimiento">
                    <TextField source="motivo" />
                </ReferenceField>
                <TextField source="fecha" label="Fecha y hora" />
                <TextField source="acciones_realizadas" label="Acciones realizadas"/>
                <TextField source="observaciones" label="Observaciones"/>
                <TextField source="responsable_nombre" label="Responsable"/>
                <TextField source="responsable_usuario" label="ID de usuario responsable"/>
                <TextField source="registrado_por" label="Registrado por (ID de usuario)"/>
            </SimpleShowLayout>
        </Show>
    );
}

export function AccionesEdit() {
    return (
        <Edit title="Editar acción">
            <SimpleForm>
                <ReferenceInput source="id_infante" reference="infantes" label="Infante">
                    <SelectInput optionText="nombre_completo" validate={required()} fullWidth/>
                </ReferenceInput>
                <FormDataConsumer>
                    {({ formData }) => formData.id_infante ? (
                        <ReferenceInput source="id_seguimiento" reference="seguimientos" label="Caso de seguimiento" filter={{ id_infante: formData.id_infante }}>
                            <SelectInput optionText="motivo" validate={required()} fullWidth />
                        </ReferenceInput>
                    ) : (
                        <SelectInput source="id_seguimiento" label="Caso de seguimiento" choices={[]} disabled fullWidth/>
                    )}
                </FormDataConsumer>
                <DateTimeInput source="fecha" label="Fecha y hora" validate={required()} />
                <TextInput source="acciones_realizadas" label="Acciones realizadas" multiline fullWidth validate={required()} />
                <TextInput source="observaciones" label="Observaciones" multiline fullWidth />
                <TextInput source="responsable_nombre" label="Nombre del responsable" validate={required()} />
                <NumberInput source="responsable_usuario" label="ID de usuario responsable (opcional)" min={1} />
            </SimpleForm>
        </Edit>
    );
}