import { List, Datagrid, TextField, BooleanField, DateField, FunctionField, useRecordContext, useNotify, useRefresh, useUpdate, TopToolbar, ExportButton,} from "react-admin";
import { Button } from "@mui/material";
import { useState } from "react";

type RelacionTutorInfante = {
    id: string;
    id_infante: number;
    id_tutor: number;
    nombre_infante: string;
    nombre_tutor: string;
    correo_tutor: string | null;
    parentesco: string;
    acceso_autorizado: boolean | number;
    autorizado_en: string | null;
    nombre_autorizador: string | null;
};

function BotonAutorizacion() {
    const record = useRecordContext<RelacionTutorInfante>();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isPending }] = useUpdate();
    const [procesando, setProcesando] = useState(false);

    if (!record) return null;
    const autorizado = record.acceso_autorizado === true || record.acceso_autorizado === 1;
    const cambiarAutorizacion = () => {
        setProcesando(true);
        update(
            "infante_tutor",
            {
                id: record.id,
                data: {
                    ...record,
                    acceso_autorizado: !autorizado,
                },
                previousData: record,
            },
            {
                mutationMode: "pessimistic",
                onSuccess: () => {
                    notify(
                        autorizado ? "Acceso revocado correctamente." : "Acceso autorizado correctamente.",
                        { type: "success" }
                    );
                    refresh();
                },
                onError: (error) => {
                    notify(
                        error instanceof Error ? error.message : "No fue posible actualizar la autorización.",
                        { type: "error" }
                    );
                },
                onSettled: () => {
                    setProcesando(false);
                },
            }
        );
    };

    return (
        <Button
            variant="contained" color={autorizado ? "error" : "success"} size="small" disabled={procesando || isPending} onClick={cambiarAutorizacion}>
            {procesando ? "Procesando..." : autorizado ? "Revocar acceso" : "Autorizar acceso"}
        </Button>
    );
}

function EstadoAutorizacion() {
    const record = useRecordContext<RelacionTutorInfante>();
    if (!record) return null;
    const autorizado = record.acceso_autorizado === true || record.acceso_autorizado === 1;
    return (
        <span>
            {autorizado ? "Autorizado" : "Pendiente"}
        </span>
    );
}

const AccionesLista = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

export const AutorizacionesList = () => (
    <List
        title="Autorizaciones de tutores" actions={<AccionesLista />} sort={{ field: "id_infante", order: "DESC" }} perPage={10} >
        <Datagrid bulkActionButtons={false}>
            <TextField source="nombre_infante" label="Infante" />
            <TextField source="nombre_tutor" label="Tutor" />
            <TextField source="correo_tutor" label="Correo del tutor" />
            <TextField source="parentesco" label="Parentesco" />
            <FunctionField label="Estado" render={() => <EstadoAutorizacion />} />
            <DateField source="autorizado_en" label="Fecha de autorización" showTime emptyText="Sin autorización" />
            <TextField source="nombre_autorizador" label="Autorizado por" emptyText="—" />
            <FunctionField label="Acción" render={() => <BotonAutorizacion />} />
        </Datagrid>
    </List>
);