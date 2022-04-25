import { SlashCommandBuilder } from "@discordjs/builders";
import {
  upgradeDAO,
  createFundingProposal,
} from "./create-funding-proposal-cmd";
import { createMicroDAOCmd } from "./create-micro-dao-cmd";
import { depositMicroDAOCmd } from "./deposit-micro-dao";
import { dissentCmd } from "./dissent-cmd";
import { executeFundingProposalCmd } from "./execute-funding-proposal-cmd";
import { buildGetFundingProposalCmd } from "./get-proposal-data";
import { buildSubscribe } from "./subscribe-to-dao";

export {
  upgradeDAO,
  createFundingProposal,
  createMicroDAOCmd,
  depositMicroDAOCmd,
  dissentCmd,
  executeFundingProposalCmd,
  buildGetFundingProposalCmd,
  buildSubscribe,
};

export const microDAOCmd = new SlashCommandBuilder()
  .setName("micro-dao")
  .setDescription(
    "The mDAO contract interface offers all the options to create and manage micro mDAOs"
  )
  .addSubcommand(createMicroDAOCmd)
  .addSubcommand(depositMicroDAOCmd)
  .addSubcommand(createFundingProposal)
  .addSubcommand(upgradeDAO)
  .addSubcommand(dissentCmd)
  .addSubcommand(executeFundingProposalCmd)
  .addSubcommand(buildGetFundingProposalCmd)
  .addSubcommand(buildSubscribe);
