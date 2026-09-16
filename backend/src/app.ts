import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

  // Serve uploaded media (audio / cover art). helmet's default
  // Cross-Origin-Resource-Policy is "same-origin", which silently blocks the
  // frontend (a different origin — different port) from loading these as
  // <img>/<audio> — loosen it just for this route, not the JSON API.
  app.use("/media", (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });
  app.use("/media", express.static(env.UPLOAD_DIR));

  // Root — quick index so hitting the bare host isn't a bare 404.
  app.get("/", (_req, res) => {
    res.json({
      name: "BassDrop API",
      docs: "endpoints live under /api",
      health: "/api/health",
    });
  });

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
