import type { IModelDao } from "./dao-interface/IModelDao";
import type { Tx } from "@/common/types";
import { GraphModel } from "@/model/GraphModel";
import { GraphVersion } from "@/model/GraphVersion";
import logger from "@/config/logger";
import { Op } from "sequelize";

const ModelDao: IModelDao = {
    createModel(data, opt?: Tx) {
        logger.debug("[ModelDao] createModel owner=%s name=%s", data.id_owner_user, data.name_model);
        return GraphModel.create(data as any, opt);
    },

    createVersion(data, opt?: Tx) {
        logger.debug("[ModelDao] createVersion model=%s v=%s", data.id_model, data.version_number_version);
        return GraphVersion.create(data as any, opt);
    },

    async findModelByPk(id, opt?: Tx) {
        if (!Number.isFinite(id)) {
            const e: any = new Error("Invalid model id");
            e.status = 400;
            throw e;
        }
        logger.debug("[ModelDao] findModelByPk id=%s", id);
        return GraphModel.findByPk(id, { ...(opt || {}) });
    },

    findVersion(modelId, version, opt?: Tx) {
        logger.debug("[ModelDao] findVersion model=%s v=%s", modelId, version);
        return GraphVersion.findOne({
            where: { id_model: modelId, version_number_version: version },
            ...(opt || {}),
        });
    },

    async findLatestVersion(modelId, opt?: Tx) {
        logger.debug("[ModelDao] findLatestVersion model=%s", modelId);
        return GraphVersion.findOne({
            where: { id_model: modelId },
            order: [["version_number_version", "DESC"]],
            ...(opt || {}),
        });
    },
};

export default ModelDao;
