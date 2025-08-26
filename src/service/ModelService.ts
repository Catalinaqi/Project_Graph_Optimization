// src/service/model/ModelService.ts
import { ModelFacade } from "./model/ModelFacade";
import type { CreateModelInput, ExecuteInput } from "@/common/types";

const facade = new ModelFacade();

export const ModelService = {
    async createModelAndCharge(input: CreateModelInput) {
        return facade.createModelAndCharge(input);
    },

    async executeAndCharge(input: ExecuteInput) {
        return facade.executeAndCharge(input);
    },

    async getModelWithLatest(modelId: number) {
        return facade.getModelWithLatest(modelId);
    }
};
