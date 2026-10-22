import { List, Datagrid, TextField, ReferenceField, BooleanField, Create, Edit, Show, SimpleForm, SimpleShowLayout, TextInput, SelectInput, ReferenceInput, required, EditButton, ShowButton, ReferenceFieldBase} from "react-admin";

const regionesChoices = [
  { id: "Norte", name: "Norte" },
  { id: "Sur", name: "Sur" },
  { id: "Este", name: "Este" },
  { id: "Oeste", name: "Oeste" },
];

export function RegionesList() {
  return <List title="Regiones"><Datagrid rowClick="show">
    <TextField source="id" label="ID" />
    <TextField source="nombre_region" label="Región" />
    <EditButton label="Editar" /><ShowButton label="Ver" />
  </Datagrid></List>;
}
export function RegionesCreate() {
  return <Create title="Registrar región"><SimpleForm>
    <SelectInput source="nombre_region" label="Nombre de la región" choices={regionesChoices} validate={required()} />
  </SimpleForm></Create>;
}
export function RegionesEdit() {
  return <Edit title="Editar región"><SimpleForm>
    <SelectInput source="nombre_region" label="Nombre de la región" choices={regionesChoices} validate={required()} />
  </SimpleForm></Edit>;
}
export function RegionesShow() {
  return <Show title="Detalle de región"><SimpleShowLayout>
    <TextField source="id" label="ID" />
    <TextField source="nombre_region" label="Región" />
  </SimpleShowLayout></Show>;
}

export function EstadosList() {
  return <List title="Estados"><Datagrid rowClick="show">
    <TextField source="id" label="ID" />
    <TextField source="nombre_estado" label="Estado" />
    <ReferenceField source="id_region" reference="regiones" label="Región">
      <TextField source="nombre_region" />
    </ReferenceField>
    <EditButton label="Editar" /><ShowButton label="Ver" />
  </Datagrid></List>;
}
export function EstadosCreate() {
  return <Create title="Registrar estado"><SimpleForm>
    <TextInput source="nombre_estado" label="Nombre del estado" validate={required()} />
    <ReferenceInput source="id_region" reference="regiones">
      <SelectInput label="Región" optionText="nombre_region" validate={required()} />
    </ReferenceInput>
  </SimpleForm></Create>;
}
export function EstadosEdit() {
  return <Edit title="Editar estado"><SimpleForm>
    <TextInput source="nombre_estado" label="Nombre del estado" validate={required()} />
    <ReferenceInput source="id_region" reference="regiones">
      <SelectInput label="Región" optionText="nombre_region" validate={required()} />
    </ReferenceInput>
  </SimpleForm></Edit>;
}
export function EstadosShow() {
  return <Show title="Detalle de estado"><SimpleShowLayout>
    <TextField source="id" label="ID" />
    <TextField source="nombre_estado" label="Estado" />
    <ReferenceField source="id_region" reference="regiones" label="Región">
      <TextField source="nombre_region"/>
    </ReferenceField>
  </SimpleShowLayout></Show>;
}

export function EBDIsList() {
  return <List title="EBDI"><Datagrid rowClick="show">
    <TextField source="id" label="ID" /><TextField source="clave" label="Clave" />
    <TextField source="nombre_ebdi" label="Nombre de EBDI" />
    <TextField source="nombre_estado" label="Estado" />
    <BooleanField source="activo" label="Activo" looseValue/>
    <EditButton label="Editar" /><ShowButton label="Ver" />
  </Datagrid></List>;
}
export function EBDIsCreate() {
  return <Create title="Registrar EBDI"><SimpleForm>
    <TextInput source="clave" label="Clave" validate={required()} />
    <TextInput source="nombre_ebdi" label="Nombre de EBDI" validate={required()} fullWidth />
    <ReferenceInput source="id_estado" reference="estados">
      <SelectInput label="Estado" optionText="nombre" validate={required()} />
    </ReferenceInput>
    <TextInput source="estado" label="Municipio" />
    <SelectInput source="activo" label="Estatus" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} />
  </SimpleForm></Create>;
}
export function EBDIsEdit() {
  return <Edit title="Editar EBDI"><SimpleForm>
    <TextInput source="clave" label="Clave" validate={required()} />
    <TextInput source="nombre_ebdi" label="Nombre de EBDI" validate={required()} fullWidth />
    <ReferenceInput source="id_estado" reference="estados">
      <SelectInput label="Estado" optionText="nombre" validate={required()} />
    </ReferenceInput>
    <TextInput source="nombre_estado" label="Municipio" />
    <SelectInput source="activo" label="Estatus" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} />
  </SimpleForm></Edit>;
}
export function EBDIsShow() {
  return <Show title="Detalle de EBDI"><SimpleShowLayout>
    <TextField source="id" label="ID" /><TextField source="clave" label="Clave" />
    <TextField source="nombre_ebdi" label="Nombre de EBDI" />
    <ReferenceField source="id_estado" reference="estados" label="Estado">
      <TextField source="nombre_estado"/>
    </ReferenceField>
    <BooleanField source="activo" label="Activo" looseValue/>
  </SimpleShowLayout></Show>;
}
