import {List, Datagrid, TextField, DateField, NumberField, ReferenceField, FormDataConsumer, FunctionField, ReferenceInput, SelectInput, NumberInput, DateInput, TextInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton} from "react-admin";
import { usePermissions } from "react-admin"; // Se necesita para poder limitar el uso de ciertos componentes por ciertos usuarios (aunque ya se limiten en la API)

const medicionesFilters = [
    <ReferenceInput key="id_infante" source="id_infante" reference="infantes" alwaysOn>
        <SelectInput label="Infante" optionText="nombre_completo" emptyText="Todos los infantes" />
    </ReferenceInput>,
    <DateInput key="fecha_medicion" source="fecha_medicion" label="Fecha de medición" alwaysOn/>,
    <SelectInput key="tipo" source="tipo" label="Tipo de medición" choices={[
            { id: "periodica", name: "Periódica" },
            { id: "extraordinaria", name: "Extraordinaria" },
        ]}
        emptyText="Todos los tipos" alwaysOn
        sx={{ minWidth: 200 }}
    />,
    <ReferenceInput key="id_ebdi_captura" source="id_ebdi_captura" reference="ebdis" >
        <SelectInput label="EBDI donde se capturó" optionText="nombre_ebdi" emptyText="Todas las EBDI" />
    </ReferenceInput>,
];

// Impide registrar mediciones con fechas futuras.
const validarFechaMedicion = (value: string) => {
  if (!value) return undefined;

  const hoy = new Date();
  const fechaActual = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

  if (value > fechaActual) {
    return "La fecha de medición no puede ser futura";
  }

  return undefined;
};
export function MedicionesList() {
  return (
    <List title="Mediciones de crecimiento" filters={medicionesFilters}>
      <Datagrid>
        <TextField source="id" label="ID" />
        <ReferenceField source="id_infante" reference="infantes" label="Infante" >
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_medicion" label="Fecha" />
        <NumberField source="peso_kg" label="Peso (kg)" />
        <NumberField source="talla_cm" label="Talla (cm)" />
        <NumberField source="perimetro_cefalico_cm" label="Perímetro cefálico (cm)" />
        <TextField source="observaciones" label="Observaciones" />
        <ShowButton label="Ver mediciones" />
        <EditButton label="Editar" />
      </Datagrid>
    </List>
  );
}

export function MedicionesCreate() {
  const { permissions } = usePermissions(); // permisos
  const esEstancia = permissions === "estancia"; // permisos para estancia
  return (
    <Create title="Registrar medición">
      <SimpleForm>
        <ReferenceInput source="id_infante" reference="infantes" >
          <SelectInput label="Infante" optionText="nombre_completo" validate={required()} fullWidth />
        </ReferenceInput>
        {!esEstancia && (
          <ReferenceInput source="id_ebdi_captura" reference="ebdis">
            <SelectInput label="EBDI donde se captura" optionText="nombre_ebdi" validate={required()} fullWidth/>
          </ReferenceInput>
        )}
        <DateInput
          source="fecha_medicion"
          label="Fecha de medición"
          validate={[required(), validarFechaMedicion]}
        />
        <NumberInput
          source="peso_kg"
          label="Peso (kg)"
          helperText="En kilogramos, ej. 7.850"
          min={0.001}
          step={0.001}
          validate={required()}
        />
        <NumberInput
          source="talla_cm"
          label="Talla (cm)"
          helperText="En centímetros, ej. 68.5"
          min={0.01}
          step={0.01}
          validate={required()}
        />
        <SelectInput source="tipo_talla" label="Tipo de talla" helperText="Acostado: menores de 2 años. De pie: 2 años o más."
          choices={[
            {
              id: "longitud_acostado",
              name: "Longitud acostado",
            },
            {
              id: "talla_de_pie",
              name: "Talla de pie",
            },
          ]} validate={required()}/>
        <NumberInput
          source="perimetro_cefalico_cm"
          label="Perímetro cefálico (cm)"
          helperText="En centímetros, ej. 45.2"
          min={0.01}
          step={0.01}
        />
        <SelectInput source="tipo" label="Tipo de medición"
          choices={[
            { 
              id: "periodica", 
              name: "Periódica" 
            },
            {
              id: "extraordinaria",
              name: "Extraordinaria",
            },
          ]}
          defaultValue="periodica"
          validate={required()}/>
          
        <FormDataConsumer>
            {({ formData }) =>
                formData.tipo === "extraordinaria" ? (
                    <TextInput source="motivo_extraordinaria" label="Motivo de la medición extraordinaria" validate={required()} multiline fullWidth />
                ) : null
            }
        </FormDataConsumer>
        <TextInput source="observaciones" label="Observaciones" multiline fullWidth />
        <TextInput source="estado_nutricional_registrado" label="Estado nutricional registrado" helperText="Captura del profesional; no es un diagnóstico automático." fullWidth/>
      </SimpleForm>
    </Create>
  );
}

export function MedicionesShow() {
  return (
    <Show title="Detalle de medición">
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <ReferenceField source="id_infante" reference="infantes" label="Infante" >
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_medicion" label="Fecha de medición" />
        <NumberField source="peso_kg" label="Peso (kg)" />
        <NumberField source="talla_cm" label="Talla (cm)" />
        <NumberField source="perimetro_cefalico_cm" label="Perímetro cefálico (cm)" />
        <TextField source="observaciones" label="Observaciones" />
      </SimpleShowLayout>
    </Show>
  );
}

export function MedicionesEdit() {
  return (
    <Edit title="Corregir medición">
      <SimpleForm>
        <DateInput
          source="fecha_medicion"
          label="Fecha de medición"
          validate={[required(), validarFechaMedicion]}
        />
        <NumberInput
          source="peso_kg"
          label="Peso (kg)"
          helperText="En kilogramos, ej. 7.850"
          min={0.001}
          step={0.001}
          validate={required()}
        />
        <NumberInput
          source="talla_cm"
          label="Talla (cm)"
          helperText="En centímetros, ej. 68.5"
          min={0.01}
          step={0.01}
          validate={required()}
        />
        <SelectInput source="tipo_talla" label="Tipo de talla" helperText="Acostado: menores de 2 años. De pie: 2 años o más."
          choices={[
            {
              id: "longitud_acostado",
              name: "Longitud acostado"
            },
            {
              id: "talla_de_pie",
              name: "Talla de pie"
            }
          ]} validate={required()}/>
        <NumberInput
          source="perimetro_cefalico_cm"
          label="Perímetro cefálico (cm)"
          helperText="En centímetros, ej. 45.2"
          min={0.01}
          step={0.01}
        />
        <SelectInput source="tipo" label="Tipo de medición"
          choices={[
            {
              id: "periodica",
              name: "Periódica"
            },
            {
              id: "extraordinaria",
              name: "Extraordinaria"
            }
          ]} defaultValue="periodica" validate={required()}/>
        <FormDataConsumer>
          {({ formData }) =>
            formData.tipo === "extraordinaria" ? (
              <TextInput source="motivo_extraordinaria" label="Motivo de la medición extraordinaria" validate={required()} multiline fullWidth/>
            ) : null
          }
        </FormDataConsumer>
        <TextInput source="observaciones" label="Observaciones" multiline fullWidth />
        <TextInput source="motivo_correccion" label="Motivo de la corrección" helperText="Explica qué dato era incorrecto y por qué debe corregirse." validate={required()} multiline fullWidth/>
      </SimpleForm>
    </Edit>
  );
}