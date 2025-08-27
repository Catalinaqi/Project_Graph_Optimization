import WeightChangeIdao from "@/dao/interfaces/weight-change.idao";
import type { Tx } from "@/common/types";
import { GraphWeightChangeRequestModel } from "@/model/graph-weight-change-request.model";
import { Op } from "sequelize";
import logger from "@/config/logger";
import { GraphRequestStatusEnum } from "@/common/enums";


const WeightChangeDao: WeightChangeIdao = {
    create(data, opt?: Tx) {
        logger.debug(
            "[WeightChangeDao] create m=%s %s->%s w=%s",
            data.id_model,
            data.from_node,
            data.to_node,
            data.suggested_weight
        );

        // suggested_weight como DECIMAL(10,2): guardamos string con 2 decimales
        return GraphWeightChangeRequestModel.create(
            {
                ...data,
                suggested_weight: Number(data.suggested_weight).toFixed(2),
            } as any,
            opt
        );
    },

    findById(requestId, opt?: Tx) {
        logger.debug("[WeightChangeDao] findById id=%s", requestId);
        return GraphWeightChangeRequestModel.findByPk(requestId, { ...(opt || {}) });
    },

    list(modelId, filters, opt?: Tx) {
        logger.debug(
            "[WeightChangeDao] list model=%s filters=%o",
            modelId,
            filters
        );

        const where: any = { id_model: modelId };
        if (filters.status) where.status = filters.status;
        if (filters.fromDate)
            where.created_at = {
                ...(where.created_at || {}),
                [Op.gte]: filters.fromDate,
            };
        if (filters.toDate)
            where.created_at = {
                ...(where.created_at || {}),
                [Op.lte]: filters.toDate,
            };

        return GraphWeightChangeRequestModel.findAll({
            where,
            order: [["created_at", "DESC"]],
            ...(opt || {}),
        });
    },

    approve(requestId, opt?: Tx) {
        logger.debug("[WeightChangeDao] approve id=%s", requestId);
        // approve
        return GraphWeightChangeRequestModel.update(
            { status: GraphRequestStatusEnum.APPROVED, updated_at_request: new Date() } as any,
            {
                where: { id_weight_change_request: requestId, status: GraphRequestStatusEnum.PENDING },
                transaction: opt?.transaction,
            }
        ).then(([n]) => n);
    },

    reject(requestId, reason, opt?: Tx) {
        logger.debug("[WeightChangeDao] reject id=%s reason=%s", requestId, reason);
        // reject
        return GraphWeightChangeRequestModel.update(
            {
                status: GraphRequestStatusEnum.REJECTED,
                reason_rejection: reason,
                updated_at_request: new Date(),
            } as any,
            {
                where: { id_weight_change_request: requestId, status: GraphRequestStatusEnum.PENDING },
                transaction: opt?.transaction,
            }
        ).then(([n]) => n);
    },
};

export default WeightChangeDao;
