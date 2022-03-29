import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/get-tx/:txId", (req, res) => {
  req.params.txId;
});
