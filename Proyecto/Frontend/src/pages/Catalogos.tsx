import { List, Datagrid, TextField, ReferenceField, BooleanField, Create, Edit, Show, SimpleForm, SimpleShowLayout, TextInput, SelectInput, ReferenceInput, required, EditButton, ShowButton} from "react-admin";

const regionesChoices = [
  { id: "Norte", name: "Norte" },
  { id: "Sur", name: "Sur" },
  { id: "Este", name: "Este" },
  { id: "Oeste", name: "Oeste" },
];

export function RegionesList() {
  return <List title="Regiones"><Datagrid rowClick="show">
    <TextField source="id" label="ID" />
    <TextField source="nombre" label="Región" />
    <TextField source="descripcion" label="Descripción" />
    <EditButton label="Editar" /><ShowButton label="Ver" />
  </Datagrid></List>;
}
export function RegionesCreate() {
  return <Create title="Registrar región"><SimpleForm>
    <SelectInput source="nombre" label="Nombre de la región" choices={regionesChoices} validate={required()} />
    <TextInput source="descripcion" label="Descripción" fullWidth />
  </SimpleForm></Create>;
}
export function RegionesEdit() {
  return <Edit title="Editar región"><SimpleForm>
    <SelectInput source="nombre" label="Nombre de la región" choices={regionesChoices} validate={required()} />
    <TextInput source="descripcion" label="Descripción" fullWidth />
  </SimpleForm></Edit>;
}
export function RegionesShow() {
  return <Show title="Detalle de región"><SimpleShowLayout>
    <TextField source="id" label="ID" /><TextField source="nombre" label="Región" />
    <TextField source="descripcion" label="Descripción" />
  </SimpleShowLayout></Show>;
}

export function EstadosList() {
  return <List title="Estados"><Datagrid rowClick="show">
    <TextField source="id" label="ID" /><TextField source="nombre" label="Estado" />
    <ReferenceField source="regionId" reference="regiones" label="Región" />
    <EditButton label="Editar" /><ShowButton label="Ver" />
  </Datagrid></List>;
}
export function EstadosCreate() {
  return <Create title="Registrar estado"><SimpleForm>
    <TextInput source="nombre" label="Nombre del estado" validate={required()} />
    <ReferenceInput source="regionId" reference="regiones" label="Región">
      <SelectInput optionText="nombre" validate={required()} />
    </ReferenceInput>
  </SimpleForm></Create>;
}
export function EstadosEdit() {
  return <Edit title="Editar estado"><SimpleForm>
    <TextInput source="nombre" label="Nombre del estado" validate={required()} />
    <ReferenceInput source="regionId" reference="regiones" label="Región">
      <SelectInput optionText="nombre" validate={required()} />
    </ReferenceInput>
  </SimpleForm></Edit>;
}
export function EstadosShow() {
  return <Show title="Detalle de estado"><SimpleShowLayout>
    <TextField source="id" label="ID" /><TextField source="nombre" label="Estado" />
    <ReferenceField source="regionId" reference="regiones" label="Región" />
  </SimpleShowLayout></Show>;
}

export function EBDIsList() {
  return <List title="EBDI"><Datagrid rowClick="show">
    <TextField source="id" label="ID" /><TextField source="clave" label="Clave" />
    <TextField source="nombre" label="Nombre de EBDI" />
    <ReferenceField source="estadoId" reference="estados" label="Estado" />
    <TextField source="municipio" label="Municipio" /><BooleanField source="activo" label="Activo" />
    <EditButton label="Editar" /><ShowButton label="Ver" />
  </Datagrid></List>;
}
export function EBDIsCreate() {
  return <Create title="Registrar EBDI"><SimpleForm>
    <TextInput source="clave" label="Clave" validate={required()} />
    <TextInput source="nombre" label="Nombre de EBDI" validate={required()} fullWidth />
    <ReferenceInput source="estadoId" reference="estados" label="Estado">
      <SelectInput optionText="nombre" validate={required()} />
    </ReferenceInput>
    <TextInput source="municipio" label="Municipio" />
    <SelectInput source="activo" label="Estatus" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} />
  </SimpleForm></Create>;
}
export function EBDIsEdit() {
  return <Edit title="Editar EBDI"><SimpleForm>
    <TextInput source="clave" label="Clave" validate={required()} />
    <TextInput source="nombre" label="Nombre de EBDI" validate={required()} fullWidth />
    <ReferenceInput source="estadoId" reference="estados" label="Estado">
      <SelectInput optionText="nombre" validate={required()} />
    </ReferenceInput>
    <TextInput source="municipio" label="Municipio" />
    <SelectInput source="activo" label="Estatus" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} />
  </SimpleForm></Edit>;
}
export function EBDIsShow() {
  return <Show title="Detalle de EBDI"><SimpleShowLayout>
    <TextField source="id" label="ID" /><TextField source="clave" label="Clave" />
    <TextField source="nombre" label="Nombre de EBDI" />
    <ReferenceField source="estadoId" reference="estados" label="Estado" />
    <TextField source="municipio" label="Municipio" /><BooleanField source="activo" label="Activo" />
  </SimpleShowLayout></Show>;
}
