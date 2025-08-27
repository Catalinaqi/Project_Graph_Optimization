import { Request, Response, NextFunction } from "express";
import * as Svc from "@/service/weight-change.service";
import ModelDao from "@/dao/model.dao";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";

async function assertOwner(modelId: number, userId: number) {
    const model = await ModelDao.findModelByPk(modelId);
    if (!model) throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);
    if (model.id_owner_user !== userId) throw getError(ErrorEnum.UNAUTHORIZED_ERROR, "Not model owner", 401);
}

const WeightChangeController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.id);
            const { from, to, weight } = req.body;
            const requesterUserId = req.user!.id;
            const data = await Svc.requestWeightChange({
                modelId, from, to,
                weight, requesterUserId });
            return res.status(201).json({ success: true, data });
        } catch (e) { next(e); }
    },

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.id);
            const { state, fromDate, toDate } = req.query as any;
            const data = await Svc.listWeightChanges(modelId, {
                status: state,
                fromDate: fromDate ? new Date(fromDate) : undefined,
                toDate: toDate ? new Date(toDate) : undefined,
            });
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },

    async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.id);
            const requestId = Number(req.params.requestId);
            const approverUserId = req.user!.id;
            await assertOwner(modelId, approverUserId);
            const data = await Svc.approveRequest({ modelId, requestId, approverUserId });
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },

    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.id);
            const requestId = Number(req.params.requestId);
            const { reason } = req.body;
            const approverUserId = req.user!.id;
            await assertOwner(modelId, approverUserId);
            const data = await Svc.rejectRequest({ modelId, requestId, reason, approverUserId });
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },

    async listVersions(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.id);
            const { fromDate, toDate, nodeCount, edgeCount } = req.query as any;
            const data = await Svc.listVersions(modelId, {
                fromDate: fromDate ? new Date(fromDate) : undefined,
                toDate: toDate ? new Date(toDate) : undefined,
                nodeCount: nodeCount != null ? Number(nodeCount) : undefined,
                edgeCount: edgeCount != null ? Number(edgeCount) : undefined,
            });
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },

    /*
    async simulate(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.id);
            const { from, to, start, stop, step, origin, goal } = req.body;

            // 👇 aquí sacamos el userId del JWT (suponiendo que lo guardas en req.user)
            const userId = (req.user as any)?.id_user;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const data = await Svc.simulateEdge({ modelId, from, to, start, stop, step, origin, goal });
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },
    */
};

export default WeightChangeController;
