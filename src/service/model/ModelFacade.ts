/*
import Database from "@/database/database";
import { ModelRepository } from "@/repository/ModelRepository";
import { ModelBuilder } from "./ModelBuilder";
import { NodeDijkstraAdapter } from "./ModelAdapter";
import { CreateModelCommand } from "./CreateModelCommand";
import { ExecuteModelCommand } from "./ExecuteModelCommand";
import { modelObserver } from "./ModelObserver";
import { getError } from "@/common/util/api.error.util";
import { ErrorEnum } from "@/common/enums";

const sequelize = Database.getInstance();
const repository = new ModelRepository();

export class ModelFacade {
    async createModelAndCharge(input: any) {
        const builder = new ModelBuilder(input.graph);
        const { nodes, edges, cost } = builder.build();

        const command = new CreateModelCommand(async () => {
            return sequelize.transaction(async (t) => {
                const user = await input.getUser(input.ownerUserId, t);
                if (!user) throw getError(ErrorEnum.NOT_FOUND_ERROR, "User not found", 404);
                if (user.tokens < cost)
                    throw getError(ErrorEnum.UNAUTHORIZED_ERROR, "Insufficient tokens", 401);

                const created = await repository.createModelWithVersion(
                    { ...input, nodeCount: nodes, edgeCount: edges, alphaUsed: null, versionNumber: 1 },
                    { transaction: t }
                );

                modelObserver.notify("MODEL_CREATED", created);
                return created;
            });
        });

        return command.execute();
    }

    async executeAndCharge(input: any) {
        const command = new ExecuteModelCommand(async () => {
            return sequelize.transaction(async (t) => {
                const latest = await repository.getLatestVersion(input.modelId, { transaction: t });
                if (!latest) throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);

                const adapter = new NodeDijkstraAdapter();
                const result = adapter.execute(latest.graph_version, input.start, input.goal);
                if (!result) throw getError(ErrorEnum.BAD_REQUEST_ERROR, "No path found", 400);

                modelObserver.notify("MODEL_EXECUTED", { ...result, modelId: input.modelId });
                return result;
            });
        });

        return command.execute();
    }
}
*/

import Database from "@/database/database";
import { ModelRepository } from "@/repository/ModelRepository";
import { ModelBuilder } from "./ModelBuilder";
import { NodeDijkstraAdapter } from "./ModelAdapter";
import { CreateModelCommand } from "./CreateModelCommand";
import { ExecuteModelCommand } from "./ExecuteModelCommand";
import { modelObserver } from "./ModelObserver";
import { getError } from "@/common/util/api.error.util";
import { ErrorEnum } from "@/common/enums";
import { PositiveTokensHandler } from "./validation/ModelValidationChain";

import type { CreateModelInput, ExecuteInput } from "@/common/types";

const sequelize = Database.getInstance();
const repository = new ModelRepository();

/**
 * ModelFacade (antes ModelService)
 *
 * Orquesta:
 *  - Repository (persistencia)
 *  - Builder (cálculo de nodos/aristas/costo)
 *  - Adapter (algoritmo de grafos)
 *  - Command (ejecución atómica)
 *  - Observer (notificaciones)
 *  - ValidationChain (reglas de negocio encadenables)
 */
export class ModelFacade {
    async createModelAndCharge(input: CreateModelInput) {
        const builder = new ModelBuilder(input.graph);
        const { nodes, edges, cost } = builder.build();

        // Validación encadenada (ejemplo simple con PositiveTokensHandler)
        const validation = new PositiveTokensHandler();
        await validation.handle({ user: { id: input.ownerUserId, token: cost } } as any);

        const command = new CreateModelCommand(async () => {
            return sequelize.transaction(async (t) => {
                // Verificación autoritativa en DB (tokens actuales)
                const user = await repository.getModel(input.ownerUserId, { transaction: t });
                if (!user) throw getError(ErrorEnum.NOT_FOUND_ERROR, "User not found", 404);

                // Lógica principal
                const created = await repository.createModelWithVersion(
                    {
                        ownerUserId: input.ownerUserId,
                        name: input.name,
                        description: input.description,
                        versionNumber: 1,
                        graph: input.graph,
                        nodeCount: nodes,
                        edgeCount: edges,
                        alphaUsed: null,
                    },
                    { transaction: t }
                );

                // Notify observer
                modelObserver.notify("MODEL_CREATED", created);

                return { ...created, costTokens: cost };
            });
        });

        return command.execute();
    }

    async executeAndCharge(input: { modelId: number; start: string; goal: string; userId: number }) {
        const command = new ExecuteModelCommand(async () => {
            return sequelize.transaction(async (t) => {
                const latest = await repository.getLatestVersion(input.modelId, { transaction: t });
                if (!latest || !latest.graph_version) {
                    throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model or graph version not found", 404);
                }

                const builder = new ModelBuilder(latest.graph_version);
                const { cost: execCharge } = builder.build();

                const adapter = new NodeDijkstraAdapter();
                const t0 = process.hrtime.bigint();
                const result = adapter.execute(latest.graph_version, input.start, input.goal);
                const t1 = process.hrtime.bigint();

                if (!result) throw getError(ErrorEnum.BAD_REQUEST_ERROR, "No path found", 400);

                const execTimeMs = Number(((Number(t1 - t0)) / 1_000_000).toFixed(4));

                // Notify observer
                modelObserver.notify("MODEL_EXECUTED", {
                    modelId: input.modelId,
                    path: result.path,
                    cost: result.cost,
                    execTimeMs,
                });

                return { ...result, execTimeMs, chargeTokens: execCharge, version: latest.version_number_version };
            });
        });

        return command.execute();
    }

    async getModelWithLatest(modelId: number) {
        const model = await repository.getModel(modelId);
        if (!model) throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);
        const latest = await repository.getLatestVersion(modelId);
        return { model, latest };
    }
}
