import { Request, Response, NextFunction } from "express";
import * as SimulationService from "@/service/simulation.service";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";
import logger from "@/config/logger";

export class SimulationController {
  async simulate(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.id);
      const { from, to, start, stop, step, origin, goal } = req.body;
      const userId = (req.user as any)?.id;

      logger.debug("[SimulationController] Raw req.body =", req.body);

      logger.debug("[SimulationController] Incoming request", {
        modelId,
        from,
        to,
        start,
        stop,
        step,
        origin,
        goal,
        userId,
      });

      const startNum = Number(start);
      const stopNum = Number(stop);
      const stepNum = Number(step);

      if (!from || !to || !origin || !goal) {
        throw getError(
          ErrorEnum.BAD_REQUEST_ERROR,
          "Missing required parameters: from, to, origin, goal",
          400,
        );
      }

      if ([startNum, stopNum, stepNum].some((v) => isNaN(v))) {
        throw getError(
          ErrorEnum.BAD_REQUEST_ERROR,
          "Invalid simulation parameters: start/stop/step must be numbers",
          400,
        );
      }

      const data = await SimulationService.simulateEdge({
        modelId,
        from,
        to,
        start: startNum,
        stop: stopNum,
        step: stepNum,
        origin,
        goal,
        userId,
      });

      logger.debug("[SimulationController] Simulation completed", {
        simulationId: data?.simulationId,
      });
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
}
