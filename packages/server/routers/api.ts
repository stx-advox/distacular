import { Router } from "express";
import { SendSTX } from "../bot/schemas/tx";
import { Model } from "mongoose";

export const apiRouter = Router();

apiRouter.get("/send-stx/:txId", (req, res) => {
  SendSTX.findById(req.params.txId, (err, tx) => {
    if (tx) {
      res.json({
        amount: tx.amount,
        recipient: tx.recipient,
      });
    } else {
      res.status(404).json({ error: "tx not found" });
    }
  });
});
