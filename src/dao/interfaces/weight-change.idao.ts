import type { Tx } from "@/common/types";
import type { GraphWeightChangeRequestModel } from "@/model/graph-weight-change-request.model";
import { GraphRequestStatusEnum } from "@/common/enums";

/**
 * DAO para solicitudes de cambio de peso en un modelo de grafo.
 */
export interface WeightChangeIdao {
    /**
     * Crear solicitud (estado 'pending').
     */
    create(
        data: {
            id_model: number;
            requester_user_id: number;
            from_node: string;
            to_node: string;
            suggested_weight: number; // lo normalizamos a 2 decimales al crear
        },
        opt?: Tx
    ): Promise<GraphWeightChangeRequestModel>;

    /**
     * Buscar solicitud por id.
     */
    findById(requestId: number, opt?: Tx): Promise<GraphWeightChangeRequestModel | null>;

    /**
     * Listar solicitudes por modelo con filtros AND.
     */
    list(
        modelId: number,
        filters: {
            status?: GraphRequestStatusEnum.PENDING | GraphRequestStatusEnum.APPROVED | GraphRequestStatusEnum.REJECTED;
            fromDate?: Date;
            toDate?: Date;
        },
        opt?: Tx
    ): Promise<GraphWeightChangeRequestModel[]>;

    /**
     * Aprobar (pasa a 'approved' si está 'pending').
     * Devuelve número de filas afectadas.
     */
    approve(requestId: number, opt?: Tx): Promise<number>;

    /**
     * Rechazar (pasa a 'rejected' si está 'pending'), con motivo.
     * Devuelve número de filas afectadas.
     */
    reject(requestId: number, reason: string, opt?: Tx): Promise<number>;
}

export default WeightChangeIdao;
