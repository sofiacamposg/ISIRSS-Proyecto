import { List, Datagrid, TextField, ReferenceField, ReferenceInput, SelectInput, TextInput, DateTimeInput, NumberInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton, FormDataConsumer, DateField} from "react-admin";

const accionesFilters = [
    <ReferenceInput key="id_infante" source="id_infante" reference="infantes" alwaysOn>
        <SelectInput label="Infante" optionText="nombre_completo" emptyText="Todos los infantes" />
    </ReferenceInput>,
    <ReferenceInput key="id_seguimiento" source="id_seguimiento" reference="seguimientos" >
        <SelectInput label="Caso de seguimiento" optionText="motivo" emptyText="Todos los casos" />
    </ReferenceInput>,
    <DateTimeInput key="fecha" source="fecha" label="Fecha y hora" />,
    <TextInput key="responsable_nombre" source="responsable_nombre" label="Responsable" alwaysOn/>,
];

export function AccionesList() {
    return (
        <List title="Acciones de seguimiento" filters={accionesFilters}>
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
                <DateField source="fecha" label="Fecha y hora" showTime />
                <TextField source="acciones_realizadas" label="Acciones realizadas" />
                <TextField source="responsable_nombre" label="Responsable" />
                <ShowButton label="Ver acción" />
                <EditButton label="Editar" />
            </Datagrid>
        </List>
    );
}

export function AccionesCreate() {
    return (
        <Create title="Registrar acción">
            <SimpleForm>
                <ReferenceInput source="id_infante" reference="infantes">
                    <SelectInput label="Infante" optionText="nombre_completo" validate={required()} fullWidth/>
                </ReferenceInput>
                <FormDataConsumer>
                    {({ formData }) => formData.id_infante ? (
                        <ReferenceInput source="id_seguimiento" reference="seguimientos" filter={{ id_infante: formData.id_infante }}>
                            <SelectInput label="Caso de seguimiento" optionText="motivo" validate={required()} fullWidth />
                        </ReferenceInput>
                    ) : (
                        <SelectInput source="id_seguimiento" label="Caso de seguimiento" choices={[]} disabled fullWidth/>
                    )}
                </FormDataConsumer>
                <DateTimeInput source="fecha" label="Fecha y hora" validate={required()} />
                <TextInput
                    source="acciones_realizadas"
                    label="Acciones realizadas"
                    helperText="Ej. orientación nutricional, cita con pediatría."
                    multiline
                    fullWidth
                    validate={required()}
                    />
                <TextInput source="observaciones" label="Observaciones" multiline fullWidth />
                <TextInput
                    source="responsable_nombre"
                    label="Nombre del responsable"
                    helperText="Nombre de quien da el seguimiento."
                    validate={required()}
                    />
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
                <DateField source="fecha" label="Fecha y hora" showTime />
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
                <ReferenceInput source="id_infante" reference="infantes">
                    <SelectInput label="Infante" optionText="nombre_completo" validate={required()} fullWidth/>
                </ReferenceInput>
                <FormDataConsumer>
                    {({ formData }) => formData.id_infante ? (
                        <ReferenceInput source="id_seguimiento" reference="seguimientos" filter={{ id_infante: formData.id_infante }}>
                            <SelectInput label="Caso de seguimiento" optionText="motivo" validate={required()} fullWidth />
                        </ReferenceInput>
                    ) : (
                        <SelectInput source="id_seguimiento" label="Caso de seguimiento" choices={[]} disabled fullWidth/>
                    )}
                </FormDataConsumer>
                <DateTimeInput source="fecha" label="Fecha y hora" validate={required()} />
                <TextInput
                    source="acciones_realizadas"
                    label="Acciones realizadas"
                    helperText="Ej. orientación nutricional, cita con pediatría."
                    multiline
                    fullWidth
                    validate={required()}
                    />
                <TextInput source="observaciones" label="Observaciones" multiline fullWidth />
                <TextInput
                    source="responsable_nombre"
                    label="Nombre del responsable"
                    helperText="Nombre de quien da el seguimiento."
                    validate={required()}
                    />
                <NumberInput source="responsable_usuario" label="ID de usuario responsable (opcional)" min={1} />
            </SimpleForm>
        </Edit>
    );
}