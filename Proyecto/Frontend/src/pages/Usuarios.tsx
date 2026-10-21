import {List, Datagrid, TextField, EmailField, DateField, FunctionField, Create, SimpleForm, TextInput, SelectInput, ReferenceInput, required, minLength, maxLength, Edit} from "react-admin";

export const UsuariosList = () => (
    <List
        title="Usuarios del sistema"
        sort={{ field: "id_usuario", order: "DESC" }}
        perPage={10}
    >
        <Datagrid bulkActionButtons={false}>
            <TextField source="id_usuario" label="ID" />
            <TextField source="nombre" label="Nombre completo" />
            <EmailField source="correo" label="Correo electrónico" />
            <TextField source="rol" label="Rol" />
            <TextField source="estado" label="Estado" />
            <DateField source="creado_en" label="Fecha de registro" showTime />
        </Datagrid>
    </List>
);

export const UsuarioCreate = () => (
    <Create title="Registrar usuario">
        <SimpleForm defaultValues={{estado: "activo",}}>
            <TextInput source="nombre" label="Nombre completo" validate={[
                    required("El nombre es obligatorio"),
                    maxLength(150, "Máximo 150 caracteres"),
                ]}
                fullWidth
            />
            <TextInput source="correo" label="Correo electrónico" type="email"
                validate={[
                    required("El correo es obligatorio"),
                    maxLength(254, "Máximo 254 caracteres"),
                ]}
                fullWidth
            />
            <TextInput source="password" label="Contraseña" type="password" autoComplete="new-password"
                validate={[
                    required("La contraseña es obligatoria"),
                    minLength(1),
                ]}
                fullWidth
            />
            <ReferenceInput source="id_rol" reference="roles" label="Rol del usuario">
                <SelectInput optionText="nombre" label="Rol" validate={required("Selecciona un rol")} fullWidth/>
            </ReferenceInput>
            <SelectInput source="estado" label="Estado de la cuenta"
                choices={[
                    { id: "activo", name: "Activo" },
                    { id: "bloqueado", name: "Bloqueado" },
                    { id: "baja", name: "Baja" },
                ]}
                validate={required("Selecciona un estado")}
                fullWidth
            />
        </SimpleForm>
    </Create>
);


export const UsuarioEdit = () => (
    <Edit title="Editar usuario">
        <SimpleForm>
            <TextInput source="id_usuario" label="ID" disabled />
            <TextInput source="nombre" label="Nombre completo" validate={[
                    required("El nombre es obligatorio"),
                    maxLength(150, "Máximo 150 caracteres"),
                ]}
                fullWidth
            />
            <TextInput source="correo" label="Correo electrónico" type="email" validate={[
                    required("El correo es obligatorio"),
                    maxLength(254, "Máximo 254 caracteres"),
                ]}
                fullWidth
            />
            <TextInput source="password" label="Nueva contraseña (opcional)" type="password" autoComplete="new-password" helperText="Déjalo vacío para conservar la contraseña actual." fullWidth />
            <ReferenceInput source="id_rol" reference="roles" label="Rol del usuario" >
                <SelectInput optionText="nombre" validate={required("Selecciona un rol")} fullWidth />
            </ReferenceInput>
            <SelectInput source="estado" label="Estado de la cuenta" choices={[
                    { id: "activo", name: "Activo" },
                    { id: "bloqueado", name: "Bloqueado" },
                    { id: "baja", name: "Baja" },
                ]}
                validate={required("Selecciona un estado")}
                fullWidth
            />
        </SimpleForm>
    </Edit>
);