import type { ModelIdao } from "@/dao/interfaces/model.idao";
import ModelDao from "./model.dao";

/**
 * * Factory to get the Model DAO instance
 * Objective: To provide a single point of access to the Model DAO instance
 *  **/
export class ModelFactoryDao {
  static createModelDao(): ModelIdao {
    return ModelDao;
  }
}
