import { Router } from "express";
import { Document } from "mongoose";
import { IMicroDAO, MicroDAO } from "../bot/schemas/micro-dao";
import { TransactionsApi, Configuration } from "@stacks/blockchain-api-client";
import { SmartContractTransaction } from "@stacks/stacks-blockchain-api-types";
import fetch from "cross-fetch";
import { FundingProposal } from "../bot/schemas/funding-proposal";

export const apiRouter = Router();

apiRouter.get("/micro-dao/:daoId", (req, res) => {
  MicroDAO.findById(req.params.daoId, (err, dao) => {
    if (!err && dao) {
      return res.json({
        name: dao.name,
        members: dao.members,
        dissentPeriod: dao.dissentPeriod,
      });
    }
    res.status(404).json({ error: "dao not found" });
  });
});

apiRouter.get("/micro-dao-by-contract/:contractId", (req, res) => {
  MicroDAO.find({ contractAddress: req.params.contractId }, (err, dao) => {
    if (!err && dao[0]) {
      return res.json({
        name: dao[0].name,
        members: dao[0].members,
        dissentPeriod: dao[0].dissentPeriod,
      });
    }
    res.status(404).json({ error: "dao not found" });
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

          return res.json({
            message: "Saved DAO successfully!",
          });
        }
      );

      // res.json(txData);
    } else {
      res.status(400).json({
        error: "Need a tx id sent in request body!",
      });
    }
  }
);

apiRouter.get("/funding-proposal/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "Send the id of the funding proposal to get it",
    });
  }

  const fundingProposal = await FundingProposal.findById(id).exec();

  if (!fundingProposal) {
    return res
      .status(404)
      .json({ error: "Couldn't find the requested funding proposal!" });
  }

  res.json({
    contractAddress: fundingProposal.daoContractAddress,
    grants: fundingProposal.grants,
    memo: fundingProposal.memo,
    tokenContractAddress: fundingProposal.tokenContractAddress,
  });
});
