import { Request, Response, NextFunction } from "express";
import logger from "@/config/logger";
import { GraphUser } from "@/model/GraphUser";
import { getLatestVersion } from "@/repository/ModelRepository"; // named export
import type { GraphVersion } from "@/model/GraphVersion";

/** Formula oficial: 0.20 * nodos + 0.01 * arcos */
function computeCostFromGraph(graph: Record<string, Record<string, number>>) {
    const nodes = Object.keys(graph || {}).length;
    const edges = Object.values(graph || {}).reduce((a, adj) => a + Object.keys(adj || {}).length, 0);
    const cost = Number((0.2 * nodes + 0.01 * edges).toFixed(2));
    return { nodes, edges, cost };
}

/**
 * Regla 2.2: el usuario debe tener tokens > 0.
 * No verifica si alcanza para la operación; para eso están los otros middlewares
 * y, definitivamente, la verificación autoritativa en el Service.
 */
export async function requirePositiveTokens(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.user?.id);
        if (!id) return res.status(401).json({ error: "Unauthorized" });

        const user = await GraphUser.findByPk(id);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const tokens = Number(user.tokens_user ?? 0);
        if (!Number.isFinite(tokens) || tokens <= 0) {
            logger.info("[TokensMW] Tokens depleted for user=%s", id);
            return res.status(401).json({ error: "Unauthorized", message: "Saldo de tokens agotado" });
        }

        res.locals.userBalance = tokens; // opcional
        next();
    } catch (e) {
        next(e);
    }
}

/**
 * Valida que el saldo alcance para CREAR un modelo con el grafo recibido en req.body.graph.
 * Requiere que antes haya corrido tu validationMiddleware(GraphSchema.create, "body").
 */
export async function ensureBalanceForModelCreation(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.user?.id);
        if (!id) return res.status(401).json({ error: "Unauthorized" });

        const user = await GraphUser.findByPk(id);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const balance = Number(user.tokens_user ?? 0);
        const { nodes, edges, cost } = computeCostFromGraph(req.body?.graph ?? {});
        logger.debug("[TokensMW] Create-model cost=%s (nodes=%s, edges=%s) balance=%s", cost, nodes, edges, balance);

        if (!Number.isFinite(cost) || cost <= 0) {
            return res.status(400).json({ error: "Invalid graph to compute cost" });
        }
        if (balance < cost) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Saldo insuficiente para crear el modelo",
                required: cost,
                balance,
            });
        }

        res.locals.requiredCost = cost; // opcional
        next();
    } catch (e) {
        next(e);
    }
}

/**
 * Valida que el saldo alcance para EJECUTAR un modelo.
 * Lee :id de params, obtiene la última versión del modelo y calcula costo.
 * Requiere que antes haya corrido validationMiddleware(IdNumericParams, "params")
 * y validationMiddleware(GraphSchema.executeQuery, "query").
 */
export async function ensureBalanceForExecution(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = Number(req.user?.id);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const modelId = Number(req.params.id);
        const version: GraphVersion | null = await getLatestVersion(modelId);
        if (!version) return res.status(404).json({ error: "Model not found" });

        const graph = version.graph_version as Record<string, Record<string, number>>;
        const { nodes, edges, cost } = computeCostFromGraph(graph);

        const user = await GraphUser.findByPk(userId);
        if (!user) return res.status(401).json({ error: "Unauthorized" });
        const balance = Number(user.tokens_user ?? 0);

        logger.debug("[TokensMW] Execute-model cost=%s (nodes=%s, edges=%s) balance=%s model=%s v=%s",
            cost, nodes, edges, balance, modelId, version.version_number_version);

        if (balance < cost) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Saldo insuficiente para ejecutar el modelo",
                required: cost,
                balance,
            });
        }

        res.locals.requiredCost = cost; // opcional
        next();
    } catch (e) {
        next(e);
    }
}
