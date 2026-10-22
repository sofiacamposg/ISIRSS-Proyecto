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
    <TextInput key="nombre_ebdi" source="nombre_ebdi" label="EBDI"/>,
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
        <TextField source="nombre_ebdi"/>
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
        {/*Valida fecha de ingreso*/}
        <DateInput source="fecha_nacimiento" label="Fecha de nacimiento" validate={[required(), validarFechaNacimiento]}/>
        <SelectInput source="sexo_patron" label="Sexo"
          choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
          ]}
          validate={required()}
        />
        <TextInput
          source="curp"
          label="CURP"
          helperText="Clave Única de Registro de Población. 18 caracteres, ej. LOMF240310MDFPRR09"
          fullWidth
        />
        <ReferenceInput
          source="id_ebdi"
          reference="ebdis"
        >
          <SelectInput
            label="EBDI"
            optionText="nombre_ebdi"
            helperText="Estancia para el Bienestar y Desarrollo Infantil."
            validate={required()}
            fullWidth
          />
        </ReferenceInput>

        {/*Valida fecha de ingreso*/}
        <DateInput source="fecha_ingreso" label="Fecha de ingreso" validate={validarFechaIngreso}/>
        <SelectInput source="activo" label="Expediente" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} />

        {/* <SelectInput source="seguimientoActivo" label="Seguimiento de crecimiento" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} /> */}
        <TextInput
          source="restricciones_nutricionales"
          label="Restricciones alimentarias"
          helperText="Ej. alergia a la leche. Déjalo vacío si no tiene."
          fullWidth
        />
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
        <TextField source="nombre_ebdi"/>
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

// La fecha de nacimiento no puede ser posterior al día actual.
const validarFechaNacimiento = (value: string) => {
  if (!value) return undefined;

  const hoy = new Date();
  const fechaActual = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

  if (value > fechaActual) {
    return "La fecha de nacimiento no puede ser futura";
  }

  return undefined;
};

// El infante no puede ingresar antes de haber nacido.
const validarFechaIngreso = (
  value: string,
  allValues: { fecha_nacimiento?: string }
) => {
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
        <DateInput source="fecha_nacimiento" label="Fecha de nacimiento" validate={[required(), validarFechaNacimiento]}/>
        <SelectInput source="sexo_patron" label="Sexo"
          choices={[
            { id: "Femenino", name: "Femenino" },
            { id: "Masculino", name: "Masculino" },
          ]}
          validate={required()}
        />
        <ReferenceInput
          source="id_ebdi"
          reference="ebdis"
        >
          <SelectInput
            label="EBDI"
            optionText="nombre_ebdi"
            helperText="Estancia para el Bienestar y Desarrollo Infantil."
            validate={required()}
            fullWidth
          />
        </ReferenceInput>
        <DateInput source="fecha_ingreso" label="Fecha de ingreso" validate={[required(), validarFechaIngreso]}/>
        <SelectInput source="activo" label="Expediente" choices={[{ id: true, name: "Activo" },{ id: false, name: "Inactivo" },]}
            parse={(value) => value === true || value === "true"}
            format={(value) => value === true || value === 1 || value === "1"}
            validate={required()}
        />
        {/* <SelectInput source="seguimientoActivo" label="Seguimiento de crecimiento" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} /> */}
        <TextInput
          source="restricciones_nutricionales"
          label="Restricciones alimentarias"
          helperText="Ej. alergia a la leche. Déjalo vacío si no tiene."
          fullWidth
        />
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