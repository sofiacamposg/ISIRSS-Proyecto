import {List, Datagrid, TextField, DateField, NumberField, FunctionField, Create, SimpleForm, TextInput, DateInput, SelectInput, required, Show, SimpleShowLayout, Edit, ShowButton, EditButton, ReferenceManyField, ReferenceInput, ReferenceField, BooleanField} from "react-admin";

const infantesFilters = [
    <TextInput key="matricula" source="matricula" label="Matrícula" alwaysOn />,
    <TextInput key="nombre_completo" source="nombre_completo" label="Nombre completo" />,
    <SelectInput key="sexo_patron" source="sexo_patron" label="Sexo"
        choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
        ]}
        emptyText="Todos" 
    />,
    <ReferenceInput key="id_ebdi" source="id_ebdi" reference="ebdis" label="EBDI" >
        <SelectInput optionText="nombre_ebdi" emptyText="Todas las EBDI" />
    </ReferenceInput>,
    <SelectInput key="activo" source="activo" label="Expediente" choices={[
            { id: true, name: "Activo" },
            { id: false, name: "Inactivo" },
        ]}
        emptyText="Todos" alwaysOn
    />,
];

export function InfantesList() {
  return (
    <List title="Infantes registrados" filters={infantesFilters} filterDefaultValues={{activo: true}}>
      <Datagrid rowClick="show">
        <TextField source="id" label="ID" />
        <TextField source="matricula" label="Matrícula" />
        <TextField source="nombre_completo" label="Nombre completo" />
        <DateField source="fecha_nacimiento" label="Fecha de nacimiento" />
        <TextField source="sexo_patron" label="Sexo" />
        <ReferenceField source="id_ebdi" reference="ebdis" label="EBDI">
          <TextField source="nombre_ebdi"/>
        </ReferenceField>
        <TextField source="nombre_tutor" label="Padre, madre o tutor" />
        <FunctionField label="Última medición" render={(record) => record.fecha_medicion || "Sin registro"} />
        {/* <FunctionField label="Días transcurridos" render={(record) => record.diasDesdeUltimaMedicion ?? "__"} /> */}
        <FunctionField label="Estado de seguimiento" render={(record) => record.estado} />
        <EditButton label="Editar" />
        <ShowButton label="Ver ficha" />
      </Datagrid>
    </List>
  );
}

export function InfantesCreate() {
  return (
    <Create title="Registrar infante">
      <SimpleForm>
        <TextInput source="matricula" label="Matrícula" validate={required()} />
        <TextInput source="nombre" label="Nombre(s)" validate={required()}/>
        <TextInput source="apellido_paterno" label="Apellido paterno"/>
        <TextInput source="apellido_materno" label="Apellido materno"/>
        <DateInput source="fecha_nacimiento" label="Fecha de nacimiento" validate={required()} />
        <SelectInput source="sexo_patron" label="Sexo"
          choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
          ]}
          validate={required()}
        />
        <TextInput source="curp" label="CURP"/>
        <ReferenceInput source="id_ebdi" reference="ebdis" label="EBDI">
          <SelectInput optionText="nombre_ebdi" validate={required()} />
        </ReferenceInput>
        <DateInput source="fecha_ingreso" label="Fecha de ingreso" />
        <SelectInput source="activo" label="Expediente" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} />
        {/* <SelectInput source="seguimientoActivo" label="Seguimiento de crecimiento" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} /> */}
        <TextInput source="restricciones_nutricionales" label="Restricciones alimentarias" fullWidth />
        <ReferenceInput source="id_tutor" reference="tutores" label="Padre, madre o tutor">
          <SelectInput optionText="nombre_tutor" validate={required()}/>
        </ReferenceInput>
        <SelectInput source="parentesco" label="Parentesco"
          choices={[
              { id: "Madre", name: "Madre" },
              { id: "Padre", name: "Padre" },
              { id: "Tutor", name: "Tutor" },
              { id: "Otro", name: "Otro" },
          ]}
          validate={required()}/>
      </SimpleForm>
    </Create>
  );
}

export function InfantesShow() {
  return (
    <Show title="Ficha del infante">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="matricula" label="Matrícula" />
        <TextField source="nombre_completo" label="Nombre completo" />
        <DateField source="fecha_nacimiento" label="Fecha de nacimiento" />
        <TextField source="sexo_patron" label="Sexo" />
        <ReferenceField source="id_ebdi" reference="ebdis" label="EBDI">
          <TextField source="nombre_ebdi"/>
        </ReferenceField>
        <DateField source="fecha_ingreso" label="Fecha de ingreso" />
        <BooleanField source="activo" label="Expediente activo" />
        {/* <BooleanField source="seguimientoActivo" label="Seguimiento activo" /> */}
        <TextField source="restricciones_nutricionales" label="Restricciones alimentarias" />
        <TextField source="nombre_tutor" label="Padre, madre o tutor" />
        {/* <ReferenceManyField reference="mediciones" target="infanteId" label="Historial de crecimiento" sort={{ field: "fecha", order: "DESC" }} perPage={100} >
          <Datagrid bulkActionButtons={false}>
            <DateField source="fecha" label="Fecha" />
            <FunctionField label="Edad en la medición" render={(record) => record.edadEnMedicion} />
            <NumberField source="pesoKg" label="Peso (kg)" />
            <NumberField source="tallaCm" label="Talla (cm)" />
            <NumberField source="perimetroCefalicoCm" label="Perímetro cefálico (cm)" />
            <TextField source="observaciones" label="Observaciones" />
          </Datagrid>
        </ReferenceManyField> */}
      </SimpleShowLayout>
    </Show>
  );
}

const validarFechaIngreso = (value: string, allValues: any) => {
    if (!value || !allValues.fecha_nacimiento) {
        return undefined;
    }

    if (value < allValues.fecha_nacimiento) {
        return "La fecha de ingreso no puede ser anterior a la fecha de nacimiento";
    }

    return undefined;
};

export function InfantesEdit() {
  return (
    <Edit title="Editar infante">
      <SimpleForm>
        <TextInput source="matricula" label="Matrícula" validate={required()} />
        <TextInput source="nombre" label="Nombre(s)" validate={required()}/>
        <TextInput source="apellido_paterno" label="Apellido paterno"/>
        <TextInput source="apellido_materno" label="Apellido materno"/>
        <DateInput source="fecha_nacimiento" label="Fecha de nacimiento" validate={required()} />
        <SelectInput source="sexo_patron" label="Sexo"
          choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
          ]}
          validate={required()}
        />
        <ReferenceInput source="id_ebdi" reference="ebdis" label="EBDI">
          <SelectInput optionText="nombre_ebdi" validate={required()} />
        </ReferenceInput>
        <DateInput source="fecha_ingreso" label="Fecha de ingreso" validate={[required(), validarFechaIngreso]}/>
        <SelectInput source="activo" label="Expediente" choices={[{ id: true, name: "Activo" },{ id: false, name: "Inactivo" },]}
            parse={(value) => value === true || value === "true"}
            format={(value) => value === true || value === 1 || value === "1"}
            validate={required()}
        />
        {/* <SelectInput source="seguimientoActivo" label="Seguimiento de crecimiento" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} /> */}
        <TextInput source="restricciones_nutricionales" label="Restricciones alimentarias" fullWidth />
        <ReferenceInput source="id_tutor" reference="tutores" label="Padre, madre o tutor">
          <SelectInput optionText="nombre_tutor" validate={required()} fullWidth/>
        </ReferenceInput>
        <SelectInput source="parentesco" label="Parentesco"
          choices={[
              { id: "Madre", name: "Madre" },
              { id: "Padre", name: "Padre" },
              { id: "Tutor", name: "Tutor" },
              { id: "Otro", name: "Otro" },
          ]}
          validate={required()}/>
      </SimpleForm>
    </Edit>
  );
}