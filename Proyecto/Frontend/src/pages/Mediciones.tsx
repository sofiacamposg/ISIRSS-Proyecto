import {List, Datagrid, TextField, DateField, NumberField, ReferenceField, FormDataConsumer, FunctionField, ReferenceInput, SelectInput, NumberInput, DateInput, TextInput, Create, Edit, Show, SimpleForm, SimpleShowLayout, required, ShowButton, EditButton} from "react-admin";

export function MedicionesList() {
  return (
    <List title="Mediciones de crecimiento">
      <Datagrid>
        <TextField source="id" label="ID" />
        <ReferenceField source="id_infante" reference="infantes" label="Infante" >
          <TextField source="nombre_completo" />
        </ReferenceField>
        <DateField source="fecha_medicion" label="Fecha" />
        <NumberField source="peso_kg" label="Peso (kg)" />
        <NumberField source="talla_cm" label="Talla (cm)" />
        <NumberField source="perimetro_cefalico_cm" label="Perimetro cefálico (cm)" />
        <TextField source="observaciones" label="Observaciones" />
        <ShowButton label="Ver mediciones" />
        <EditButton label="Editar" />
      </Datagrid>
    </List>
  );
}

export function MedicionesCreate() {
  return (
    <Create title="Registrar medición">
      <SimpleForm>
        <ReferenceInput source="id_infante" reference="infantes" label="Infante" >
          <SelectInput optionText="nombre_completo" validate={required()} fullWidth />
        </ReferenceInput>
        <ReferenceInput source="id_ebdi_captura" reference="ebdis" label="EBDI donde se captura">
          <SelectInput optionText="nombre_ebdi" validate={required()} fullWidth/>
        </ReferenceInput>
        <DateInput source="fecha_medicion" label="Fecha de medición" validate={required()} />
        <NumberInput source="peso_kg" label="Peso (kg)" min={0.001} step={0.001} validate={required()} />
        <NumberInput source="talla_cm" label="Talla (cm)" min={0.01} step={0.01} validate={required()} />
        <SelectInput source="tipo_talla" label="Tipo de talla" 
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
        <NumberInput source="perimetro_cefalico_cm" label="Perimetro cefálico (cm)" min={0.01} step={0.01} />
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
        <NumberField source="perimetro_cefalico_cm" label="Perimetro cefálico (cm)" />
        <TextField source="observaciones" label="Observaciones" />
      </SimpleShowLayout>
    </Show>
  );
}

export function MedicionesEdit() {
  return (
    <Edit title="Corregir medición">
      <SimpleForm>
        <DateInput source="fecha_medicion" label="Fecha de medición" validate={required()}/>
        <NumberInput source="peso_kg" label="Peso (kg)" min={0.001} step={0.001} validate={required()}/>
        <NumberInput source="talla_cm" label="Talla (cm)" min={0.01} step={0.01} validate={required()}/>
        <SelectInput source="tipo_talla" label="Tipo de talla" 
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
        <NumberInput source="perimetro_cefalico_cm" label="Perímetro cefálico (cm)" min={0.01} step={0.01}/>
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