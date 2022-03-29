import express from "express";
import path from "path";
import { run } from "./bot";
import { apiRouter } from "./routers/api";
import cors from "cors";
const port = process.env.PORT || 8244;

const app = express();

const additional = process.env.NODE_ENV === "production" ? ".." : "";

if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}
app.use(
  express.static(path.join(__dirname, additional, "..", "client", "build"))
);

app.use("/api", apiRouter);

app.use("*", function (request, response) {
  response.sendFile(
    path.resolve(__dirname, additional, "..", "client", "build", "index.html")
  );
});

run().catch(console.dir);

app.listen(port);
