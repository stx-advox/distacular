import express from "express";
import path from "path";
import { run } from "./bot";
import { apiRouter } from "./routers/api";
const port = process.env.PORT || 8244;

const app = express();

app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.use("/api", apiRouter);

app.use("*", function (request, response) {
  response.sendFile(
    path.resolve(__dirname, "..", "client", "build", "index.html")
  );
});

run().catch(console.dir);

app.listen(port);
