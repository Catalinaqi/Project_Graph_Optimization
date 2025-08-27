import "express";
import type { UserPayloadTypeSafe } from "@/common/types";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayloadTypeSafe;
  }
}
