import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Express } from "express";
import path from "path";

export function setupSwagger(app: Express) {
  //const swaggerPath = path.join(__dirname, "swagger.yaml");
  //const swaggerDocument = YAML.load(swaggerPath);

  const swaggerPath = path.resolve(process.cwd(), "src/config/swagger.yaml");
  const swaggerDocument = YAML.load(swaggerPath);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
