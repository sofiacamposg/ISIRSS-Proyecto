import {List, Datagrid, TextField, EmailField, DateField, FunctionField, Create, SimpleForm, TextInput, SelectInput, ReferenceInput, required, minLength, maxLength, Edit, SelectField} from "react-admin";

// roles del sistema
const rolesUsuario = [
    {id:"administrador", name:"Administrador" },
    {id:"coordinador_regional", name:"Coordinador regional" },
    {id:"estancia", name:"Personal de EBDI" },
    {id:"tutor", name:"Tutor" },
];

// estados de la cuenta
const estadosCuenta = [
    {id:"activo", name:"Activo" },
    {id:"bloqueado", name:"Bloqueado" },
    {id:"baja", name:"Baja" },
];
// Filtros de la lista de usuarios
const usuarioFilters = [
    <TextInput key="nombre" source="nombre" label="Nombre completo" />,
    <TextInput key="correo" source="correo" label="Correo electrónico" alwaysOn />,
    <ReferenceInput key="id_rol" source="id_rol" reference="roles" >
        <SelectInput label="Rol" optionText="nombre" emptyText="Todos los roles" />
    </ReferenceInput>,
    <SelectInput key="estado" source="estado" label="Estado" choices={[
            { id: "activo", name: "Activo" },
            { id: "bloqueado", name: "Bloqueado" },
            { id: "baja", name: "Baja" },
        ]}
        emptyText="Todos los estados" alwaysOn
    />,
];

export const UsuariosList = () => (
    <List title="Usuarios del sistema" sort={{ field: "id_usuario", order: "DESC" }} perPage={10} filters={usuarioFilters} filterDefaultValues={{ estado: "activo"}}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="id_usuario" label="ID" />
            <TextField source="nombre" label="Nombre completo" />
            <EmailField source="correo" label="Correo electrónico" />
            <SelectField source="rol" label="Rol" choices={rolesUsuario} />
            <SelectField source="estado" label="Estado" choices={estadosCuenta} />
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
            <ReferenceInput source="id_rol" reference="roles">
                <SelectInput label="Rol del usuario" optionText="nombre" validate={required("Selecciona un rol")} fullWidth/>
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
            <ReferenceInput source="id_rol" reference="roles" >
                <SelectInput label="Rol del usuario" optionText="nombre" validate={required("Selecciona un rol")} fullWidth />
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