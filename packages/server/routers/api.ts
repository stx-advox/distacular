import { Router } from "express";
import { SendSTX } from "../bot/schemas/tx";
import { Document } from "mongoose";
import { IMicroDAO, MicroDAO } from "../bot/schemas/micro-dao";
import {
  TransactionsApi,
  SmartContractsApi,
  Configuration,
} from "@stacks/blockchain-api-client";
import { SmartContractTransaction } from "@stacks/stacks-blockchain-api-types";
import fetch from "cross-fetch";
import { deployCommands } from "../bot/utils/deploy-commands";

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

apiRouter.get("/micro-dao/:daoId", (req, res) => {
  MicroDAO.findById(req.params.daoId, (err, dao) => {
    if (dao) {
      res.json({
        name: dao.name,
        members: dao.members,
      });
    }
  });
});

apiRouter.put<any, { daoId: string }, any, { txId: string }>(
  "/micro-dao/:daoId/contract-address",
  async (req, res) => {
    const { txId } = req.body;
    if (txId) {
      const config = new Configuration({
        fetchApi: fetch,
        basePath: process.env.STACKS_URL,
      });
      const txAPI = new TransactionsApi(config);
      let txData;
      try {
        txData = (await txAPI.getTransactionById({
          txId: txId,
          eventLimit: 1,
        })) as SmartContractTransaction;
      } catch (e) {
        console.error("error while fetching tx", e);
      }

      if (txData.tx_type !== "smart_contract") {
        return res.status(400).json({
          error: "tx id was not a smart contract deploy tx",
        });
      }

      const { smart_contract } = txData;

      const [deployerAddress, contractName] =
        smart_contract.contract_id.split(".");
      const daoMembersAddresses = [
        deployerAddress,
        smart_contract.source_code.match(/S[PM]\w+/g),
      ];

      MicroDAO.findById(
        req.params.daoId,
        async (err, dao: Document<unknown, any, IMicroDAO> & IMicroDAO) => {
          if (err) {
            return res.status(404).json({
              error: `Couldn't find the DAO`,
            });
          }

          const members = dao.members as string[];

          const allMembersAreIncluded = members.every((member) =>
            daoMembersAddresses.includes(member)
          );

          if (!allMembersAreIncluded) {
            return res.status(400).json({
              error: "DAO members do not match",
            });
          }

          if (dao.name !== contractName) {
            return res.status(400).json({
              error: "Sorry dude DAO name must match you done fucked up",
            });
          }

          if (dao.contractAddress) {
            return res.status(400).json({
              error: "Contract address is already set!",
            });
          }

          dao.contractAddress = smart_contract.contract_id;

          await dao.save();

          res.json({
            message: "Saved DAO successfully!",
          });

          deployCommands();
        }
      );

      // res.json(txData);
    }
  }
);
