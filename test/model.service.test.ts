import { ModelService } from "@/service/model.service";

jest.mock("@/service/model/model-facade", () => {
    return {
        ModelFacade: jest.fn().mockImplementation(() => ({
            createModelAndCharge: jest.fn((input) => {
                if (!input.graph || Object.keys(input.graph).length === 0) {
                    throw new Error("Invalid graph");
                }
                return { id_model: 1, graph: input.graph };
            }),
        })),
    };
});

describe("ModelService", () => {
    it("should create a valid model with nodes and edges", async () => {
        const graph = {
            A: { B: 2, C: 4 },
            B: { A: 2, D: 1 },
            C: { A: 4, D: 3 },
            D: { B: 1, C: 3 }
        };

        const result = await ModelService.createModelAndCharge({
            name: "Test Graph",
            description: null,        // 👈 obligatorio según la interfaz
            graph,
            ownerUserId: 1            // 👈 aquí no es userId, es ownerUserId
        });

        expect(result).toHaveProperty("id_model");
        expect(result.graph).toEqual(graph);
    });

    it("should throw an error when graph is invalid", async () => {
        const invalidGraph = {};

        await expect(
            ModelService.createModelAndCharge({
                name: "Bad Graph",
                description: null,
                graph: invalidGraph,
                ownerUserId: 1
            })
        ).rejects.toThrow("Invalid graph");
    });
});
