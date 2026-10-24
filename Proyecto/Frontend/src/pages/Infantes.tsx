import {List, Datagrid, TextField, DateField, NumberField, FunctionField, Create, SimpleForm, TextInput, DateInput, SelectInput, required, Show, SimpleShowLayout, Edit, ShowButton, EditButton, ReferenceManyField, ReferenceInput, ReferenceField, BooleanField, SelectField} from "react-admin";
import { usePermissions } from "react-admin"; // Se necesita para poder limitar el uso de ciertos componentes por ciertos usuarios (aunque ya se limiten en la API)

const opcionesSexo = [
  { id: "femenino", name: "Femenino" },
  { id: "masculino", name: "Masculino" },
  { id: "no_especificado", name: "No especificado" },
];

const estadosSeguimiento = [
  { id: "requiere_seguimiento", name: "Requiere seguimiento" },
  { id: "en_seguimiento", name: "En seguimiento" },
  { id: "concluido", name: "Seguimiento concluido" },
];

const infantesFilters = [
    <TextInput key="matricula" source="matricula" label="Matrícula" alwaysOn />,
    <TextInput key="nombre_completo" source="nombre_completo" label="Nombre completo" />,
    <SelectInput key="sexo_patron" source="sexo_patron" label="Sexo" choices={opcionesSexo} emptyText="Todos" />,
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
        <SelectField source="sexo_patron" label="Sexo" choices={opcionesSexo} />
        <TextField source="nombre_ebdi" label="EBDI"/>
        <TextField source="nombre_tutor" label="Padre, madre o tutor" />
        <DateField source="fecha_medicion" label="Última medición" emptyText="Sin registro" />
        <SelectField source="estado" label="Estado de seguimiento" choices={estadosSeguimiento} emptyText="Sin seguimiento" />
        <EditButton label="Editar" />
        <ShowButton label="Ver ficha" />
      </Datagrid>
    </List>
  );
}

export function InfantesCreate() {
  const {permissions} = usePermissions(); // Permisos
  const esEstancia = permissions ==="estancia"; // permisos para estancia
  return (
    <Create title="Registrar infante">
      <SimpleForm>
        <TextInput source="matricula" label="Matrícula" validate={required()} />
        <TextInput source="nombre" label="Nombre(s)" validate={required()}/>
        <TextInput source="apellido_paterno" label="Apellido paterno"/>
        <TextInput source="apellido_materno" label="Apellido materno"/>
        {/*Valida fecha de ingreso*/}
        <DateInput source="fecha_nacimiento" label="Fecha de nacimiento" validate={[required(), validarFechaNacimiento]}/>
        <SelectInput source="sexo_patron" label="Sexo" choices={opcionesSexo} validate={required()} />
        <TextInput source="curp" label="CURP" helperText="Clave Única de Registro de Población. 18 caracteres, ej. LOMF240310MDFPRR09" fullWidth />
        {!esEstancia && (
          <ReferenceInput source="id_ebdi" reference="ebdis" >
            <SelectInput label="EBDI" optionText="nombre_ebdi" helperText="Estancia para el Bienestar y Desarrollo Infantil." validate={required()} fullWidth />
          </ReferenceInput>
        )}

        {/*Valida fecha de ingreso*/}
        <DateInput source="fecha_ingreso" label="Fecha de ingreso" validate={[required(), validarFechaIngreso]}/>
        <SelectInput source="activo" label="Expediente" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} />

        <SelectInput source="seguimientoActivo" label="Seguimiento de crecimiento" choices={[{ id: true, name: "Activo" }, { id: false, name: "Inactivo" }]} defaultValue={true} />
        <TextInput source="restricciones_nutricionales" label="Restricciones alimentarias" helperText="Ej. alergia a la leche. Déjalo vacío si no tiene." fullWidth />
        <ReferenceInput source="id_tutor" reference="tutores">
          <SelectInput label="Padre, madre o tutor" optionText="nombre_tutor" validate={required()}/>
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
        <SelectField source="sexo_patron" label="Sexo" choices={opcionesSexo} />
        <TextField source="nombre_ebdi" label="EBDI" />
        <DateField source="fecha_ingreso" label="Fecha de ingreso" />
        <BooleanField source="activo" label="Expediente activo" />
        <BooleanField source="seguimientoActivo" label="Seguimiento activo" />
        <TextField source="restricciones_nutricionales" label="Restricciones alimentarias" />
        <TextField source="nombre_tutor" label="Padre, madre o tutor" />
        <ReferenceManyField reference="mediciones" target="id_infante" label="Historial de crecimiento" >
          <Datagrid bulkActionButtons={false}>
            <DateField source="fecha_medicion" label="Fecha" />
            <NumberField source="peso_kg" label="Peso (kg)" />
            <NumberField source="talla_cm" label="Talla (cm)" />
            <NumberField source="perimetro_cefalico_cm" label="Perímetro cefálico (cm)" />
            <TextField source="observaciones" label="Observaciones" />
          </Datagrid>
        </ReferenceManyField>
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
  const {permissions} = usePermissions(); // Permisos
  const esEstancia = permissions ==="estancia"; // permisos para estancia
  return (
    <Edit title="Editar infante">
      <SimpleForm>
        <TextInput source="matricula" label="Matrícula" validate={required()} />
        <TextInput source="nombre" label="Nombre(s)" validate={required()}/>
        <TextInput source="apellido_paterno" label="Apellido paterno"/>
        <TextInput source="apellido_materno" label="Apellido materno"/>
        <DateInput source="fecha_nacimiento" label="Fecha de nacimiento" validate={[required(), validarFechaNacimiento]}/>
        <SelectInput source="sexo_patron" label="Sexo" choices={opcionesSexo} validate={required()} />
        {!esEstancia && (
          <ReferenceInput source="id_ebdi" reference="ebdis" >
            <SelectInput label="EBDI" optionText="nombre_ebdi" helperText="Estancia para el Bienestar y Desarrollo Infantil." validate={required()} fullWidth />
          </ReferenceInput>
        )}
        <DateInput source="fecha_ingreso" label="Fecha de ingreso" validate={[required(), validarFechaIngreso]}/>
        <SelectInput source="activo" label="Expediente" choices={[{ id: true, name: "Activo" },{ id: false, name: "Inactivo" },]}
            parse={(value) => value === true || value === "true"}
            format={(value) => value === true || value === 1 || value === "1"}
            validate={required()}
        />
        <TextInput source="restricciones_nutricionales" label="Restricciones alimentarias" helperText="Ej. alergia a la leche. Déjalo vacío si no tiene." fullWidth />
        <ReferenceInput source="id_tutor" reference="tutores">
          <SelectInput label="Padre, madre o tutor" optionText="nombre_tutor" validate={required()} fullWidth/>
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