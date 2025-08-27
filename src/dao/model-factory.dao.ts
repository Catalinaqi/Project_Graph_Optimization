import type { ModelIdao } from "@/dao/interfaces/model.idao";
import ModelDao from "./model.dao";

export class ModelFactoryDao {
    static createModelDao(): ModelIdao {
        return ModelDao; // puedes cambiar a InMemoryModelDao para testing
    }
}
