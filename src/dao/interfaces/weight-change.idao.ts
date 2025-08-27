import type { Tx } from "@/common/types";
import type { GraphWeightChangeRequestModel } from "@/model/graph-weight-change-request.model";
import { GraphRequestStatusEnum } from "@/common/enums";

export interface WeightChangeIdao {
  create(
    data: {
      id_model: number;
      requester_user_id: number;
      from_node: string;
      to_node: string;
      suggested_weight: number;
    },
    opt?: Tx,
  ): Promise<GraphWeightChangeRequestModel>;

  findById(
    requestId: number,
    opt?: Tx,
  ): Promise<GraphWeightChangeRequestModel | null>;

  list(
    modelId: number,
    filters: {
      status?:
        | GraphRequestStatusEnum.PENDING
        | GraphRequestStatusEnum.APPROVED
        | GraphRequestStatusEnum.REJECTED;
      fromDate?: Date;
      toDate?: Date;
    },
    opt?: Tx,
  ): Promise<GraphWeightChangeRequestModel[]>;

  approve(requestId: number, opt?: Tx): Promise<number>;

  reject(requestId: number, reason: string, opt?: Tx): Promise<number>;
}

export default WeightChangeIdao;
