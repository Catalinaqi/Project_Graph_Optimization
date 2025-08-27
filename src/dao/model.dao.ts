import type { ModelIdao } from "@/dao/interfaces/model.idao";
import type { Tx } from "@/common/types";
import { GraphModel } from "@/model/graph.model";
import { GraphVersionModel } from "@/model/graph-version.model";
import logger from "@/config/logger";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";

const ModelDao: ModelIdao = {
    async createModel(data, opt?: Tx) {
        try {
            logger.debug("[ModelDao] createModel owner=%s name=%s", data.id_owner_user, data.name_model);
            return await GraphModel.create(data as any, opt);
        } catch (err) {
            logger.error("[ModelDao] Error creating model %o", err);
            throw getError(ErrorEnum.GENERIC_ERROR, "Error creating model", 500);
        }
    },

    async createVersion(data, opt?: Tx) {
        try {
            logger.debug("[ModelDao] createVersion model=%s v=%s", data.id_model, data.version_number_version);
            return await GraphVersionModel.create(data as any, opt);
        } catch (err) {
            logger.error("[ModelDao] Error creating version %o", err);
            throw getError(ErrorEnum.GENERIC_ERROR, "Error creating version", 500);
        }
    },

    async findModelByPk(id, opt?: Tx) {
        if (!Number.isFinite(id)) {
            throw getError(ErrorEnum.BAD_REQUEST_ERROR, "Invalid model id", 400);


        }

        return GraphModel.findByPk(id, { ...(opt || {}) });
    },

    async findVersion(modelId, version, opt?: Tx) {

        return GraphVersionModel.findOne({
            where: { id_model: modelId, version_number_version: version },
            ...(opt || {}),
        });
    },

    async findLatestVersion(modelId, opt?: Tx) {

        return GraphVersionModel.findOne({
            where: { id_model: modelId },
            order: [["version_number_version", "DESC"]],
            ...(opt || {}),
        });
    },
};

export default ModelDao;
