import Database from "@/database/database";
import { ModelRepository } from "@/repository/model.repository";
import UserRepository from "@/repository/user.repository"; // ✅ usar repo de usuarios
import { ModelBuilder } from "./model-builder";
import { NodeDijkstraAdapter } from "./model-adapter";
import { CreateModelCommand } from "./create-model-command";
import { ExecuteModelCommand } from "./execute-model-command";
import { modelObserver } from "./model-observer";
import { getError } from "@/common/util/api-error";
import { ErrorEnum, ReasonTokenTransactionEnum } from "@/common/enums";
import { PositiveTokensHandler } from "./validation/model-validation-chain";

import type { CreateModelInput } from "@/common/types";

const sequelize = Database.getInstance();
const modelRepository = new ModelRepository();

export class ModelFacade {
  async createModelAndCharge(input: CreateModelInput) {
    const builder = new ModelBuilder(input.graph);
    const { nodes, edges, cost } = builder.build();

    const validation = new PositiveTokensHandler();
    await validation.handle({
      user: { id: input.ownerUserId, token: cost },
    } as any);

    const command = new CreateModelCommand(async () => {
      return sequelize.transaction(async (t) => {
        const user = await UserRepository.getById(input.ownerUserId, {
          transaction: t,
        });
        if (!user)
          throw getError(ErrorEnum.NOT_FOUND_ERROR, "User not found", 404);

        const tokens = Number(user.tokens_user);
        if (tokens < cost)
          throw getError(
            ErrorEnum.UNAUTHORIZED_ERROR,
            "Insufficient tokens",
            401,
          );

        const created = await modelRepository.createModelWithVersion(
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
          { transaction: t },
        );

        await UserRepository.chargeByUserId({
          userId: input.ownerUserId,
          newBalance: tokens - cost,
          performerId: input.ownerUserId, // el mismo user
          reason: ReasonTokenTransactionEnum.MODEL_CREATION_RECHARGE,
          transaction: t,
        });

        modelObserver.notify("MODEL_CREATED", created);

        return {
          ...created,
          costTokens: cost,
          remainingTokens: tokens - cost,
          nodes,
          edges,
        };
      });
    });

    return command.execute();
  }

  async executeAndCharge(input: {
    modelId: number;
    start: string;
    goal: string;
    userId: number;
  }) {
    const command = new ExecuteModelCommand(async () => {
      return sequelize.transaction(async (t) => {
        const latest = await modelRepository.getLatestVersion(input.modelId, {
          transaction: t,
        });
        if (!latest || !latest.graph_version) {
          throw getError(
            ErrorEnum.NOT_FOUND_ERROR,
            "Model or graph version not found",
            404,
          );
        }

        const builder = new ModelBuilder(latest.graph_version);
        const { cost: execCharge } = builder.build();

        const adapter = new NodeDijkstraAdapter();
        const t0 = process.hrtime.bigint();
        const result = adapter.execute(
          latest.graph_version,
          input.start,
          input.goal,
        );
        const t1 = process.hrtime.bigint();

        if (!result)
          throw getError(ErrorEnum.BAD_REQUEST_ERROR, "No path found", 400);

        const execTimeMs = Number((Number(t1 - t0) / 1_000_000).toFixed(4));

        // 🔔 Notificar observer
        modelObserver.notify("MODEL_EXECUTED", {
          modelId: input.modelId,
          path: result.path,
          cost: result.cost,
          execTimeMs,
        });

        return {
          ...result,
          execTimeMs,
          chargeTokens: execCharge,
          version: latest.version_number_version,
        };
      });
    });

    return command.execute();
  }

  async getModelWithLatest(modelId: number) {
    const model = await modelRepository.getModel(modelId);
    if (!model)
      throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);
    const latest = await modelRepository.getLatestVersion(modelId);
    return { model, latest };
  }
}
