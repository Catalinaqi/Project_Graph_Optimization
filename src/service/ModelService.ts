import Graph from "node-dijkstra";
import { Sequelize } from "sequelize";
import Database from "@/database/database";
import logger from "@/config/logger";
import { getError } from "@/common/util/api.error.util";
import { createModelWithVersion, getLatestVersion, getModel } from "@/repository/ModelRepository";
import UserRepository from "@/repository/UserRepository";
import { ErrorEnum } from "@/common/enums";
import type { CreateModelInput, ExecuteInput } from "@/common/types";

const sequelize: Sequelize = Database.getInstance();

export function computeCost(graph: Record<string, Record<string, number>>) {
    const nodes = Object.keys(graph || {}).length;
    const edges = Object.values(graph || {}).reduce((a, o) => a + Object.keys(o || {}).length, 0);
    return { nodes, edges, cost: Number((0.2 * nodes + 0.01 * edges).toFixed(2)) };
}

export async function createModelAndCharge(input: CreateModelInput) {
    const { ownerUserId, name, description, graph } = input;
    const { nodes, edges, cost } = computeCost(graph);

    return sequelize.transaction(async (t) => {
        const user = await UserRepository.getById(ownerUserId, { transaction: t });
        if (!user) throw getError(ErrorEnum.NOT_FOUND_ERROR, "User not found", 404);

        const balance = Number.parseFloat(String(user.tokens_user));
        if (!Number.isFinite(balance)) {
            logger.error("[ModelService] Invalid tokens_user: %o", user.tokens_user);
            throw getError(ErrorEnum.GENERIC_ERROR, "Corrupted token balance", 500);
        }
        if (balance < cost)
            throw getError(ErrorEnum.UNAUTHORIZED_ERROR, "Insufficient tokens to create the model", 401);

        const created = await createModelWithVersion(
            { ownerUserId, name, description, versionNumber: 1, graph, nodeCount: nodes, edgeCount: edges, alphaUsed: null },
            { transaction: t }
        );

        const newBalance = Number((balance - cost).toFixed(2));
        await UserRepository.chargeByUserId({
            userId: ownerUserId,
            newBalance,
            performerId: ownerUserId,
            reason: "model creation charge",
            transaction: t,
        });

        logger.info(
            "[ModelService] Model created id=%s nodes=%s edges=%s cost=%s newBalance=%s",
            created.modelId, nodes, edges, cost, newBalance
        );

        return {
            modelId: created.modelId,
            name,
            version: 1,
            nodes,
            edges,
            costTokens: cost,
            balanceAfter: newBalance,
            createdAt: created.createdAt,
        };
    });
}

export async function executeAndCharge(input: ExecuteInput) {
    const { modelId, start, goal, userId } = input;

    return sequelize.transaction(async (t) => {
        const latest = await getLatestVersion(modelId, { transaction: t });
        if (!latest) throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);

        const graph = latest.graph_version as Record<string, Record<string, number>>;
        if (!graph[start] || !graph[goal])
            throw getError(ErrorEnum.BAD_REQUEST_ERROR, "Invalid parameters: unknown start or goal node", 400);

        const { cost: execCharge } = computeCost(graph);

        const user = await UserRepository.getById(userId, { transaction: t });
        if (!user) throw getError(ErrorEnum.NOT_FOUND_ERROR, "User not found", 404);

        const balance = Number.parseFloat(String(user.tokens_user));
        if (!Number.isFinite(balance))
            throw getError(ErrorEnum.GENERIC_ERROR, "Corrupted token balance", 500);
        if (balance < execCharge)
            throw getError(ErrorEnum.UNAUTHORIZED_ERROR, "Insufficient tokens to execute the model", 401);

        const g = new Graph(graph);
        const t0 = process.hrtime.bigint();
        const result: any = g.path(start, goal, { cost: true });
        const t1 = process.hrtime.bigint();
        if (!result || !Array.isArray(result.path))
            throw getError(ErrorEnum.BAD_REQUEST_ERROR, `No path found between '${start}' and '${goal}'`, 400);

        const execTimeMs = Number(((Number(t1 - t0)) / 1_000_000).toFixed(4));

        const newBalance = Number((balance - execCharge).toFixed(2));
        await UserRepository.chargeByUserId({
            userId,
            newBalance,
            performerId: userId,
            reason: "model execution charge",
            transaction: t,
        });

        return {
            path: result.path,
            pathCost: result.cost,
            execTimeMs,
            chargeTokens: execCharge,
            balanceAfter: newBalance,
            version: latest.version_number_version,
        };
    });
}

export async function getModelWithLatest(modelId: number) {
    const model = await getModel(modelId);
    if (!model) throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);
    const latest = await getLatestVersion(modelId);
    return { model, latest };
}
