import { Router } from "express";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import modelsRouter from "./models.router";

const api = Router();

api.use("/auth", authRouter);

api.use("/users", userRouter);

api.use("/models", modelsRouter);

export default api;
