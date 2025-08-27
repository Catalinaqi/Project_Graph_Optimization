import logger from "@/config/logger";
import winston from "winston";

// Silence console output during tests
beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});

  for (const transport of logger.transports) {
    if (transport instanceof winston.transports.Console) {
      transport.silent = true;
    }
  }
});

afterAll(async () => {});
