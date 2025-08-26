import type { IModelDao } from "./dao-interface/IModelDao";
import ModelDao from "./ModelDao";

export class DaoFactory {
    static createModelDao(): IModelDao {
        return ModelDao; // puedes cambiar a InMemoryModelDao para testing
    }
}
