import express from "express";
import path from "path";
import { run } from "./bot";
import { apiRouter } from "./routers/api";
const port = process.env.PORT || 8244;

const app = express();

app.use("/api", apiRouter);

app.use("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "index.html"));
});

run().catch(console.dir);

app.listen(port);
