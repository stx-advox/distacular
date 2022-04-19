import express from "express";
import path from "path";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

import { apiRouter } from "./routers/api";
import cors from "cors";
import { connectDB } from "./bot/utils/connect-db";
import { config } from "dotenv";
const port = process.env.PORT || 8244;
import "./bot";

config();

const app = express();

const additional = process.env.NODE_ENV === "production" ? ".." : "";

if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}

app.use(express.json());

app.use(
  express.static(path.join(__dirname, additional, "..", "client", "build"))
);

app.use("/api", apiRouter);

app.use("*", function (request, response) {
  response.sendFile(
    path.resolve(__dirname, additional, "..", "client", "build", "index.html")
  );
});

connectDB().catch(console.dir);

app.listen(port);
