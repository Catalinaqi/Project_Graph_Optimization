import type { Tx } from "@/common/types";
import type { GraphWeightChangeRequestModel } from "@/model/graph-weight-change-request.model";
import { GraphRequestStatusEnum } from "@/common/enums";

export interface WeightChangeIdao {
  /**
   * Create a new weight change request.
   *  **/
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

  /**
   * Find a weight change request by its ID.
   *  **/
  findById(
    requestId: number,
    opt?: Tx,
  ): Promise<GraphWeightChangeRequestModel | null>;

  /**
   * List weight change requests for a specific model with optional filters.
   *  **/
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

  /**
   * Approve a weight change request.
   *  **/
  approve(requestId: number, opt?: Tx): Promise<number>;

  /**
   * Reject a weight change request with a reason.
   *  **/
  reject(requestId: number, reason: string, opt?: Tx): Promise<number>;
}

export default WeightChangeIdao;
