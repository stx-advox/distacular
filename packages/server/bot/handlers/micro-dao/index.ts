import { buildSubscribe } from "../../utils/commands/micro-dao/subscribe-to-dao";
import { CommandInteraction } from "discord.js";
import { handleCreateFundingProposal } from "./handleCreateFundingProposal";
import { handleCreateMicroDAO } from "./handleCreateMDAO";
import { handleDepositMicroDAO } from "./handleDepositMDAO";
import { handleDissent } from "./handleDissent";
import { handleExecuteFundingProposal } from "./handleExecuteFundingProposal";
import { handleGetFundingProposal } from "./handleGetProposal";
import { handleSubscribe } from "./handleSubscribe";
import {
  buildGetFundingProposalCmd,
  createFundingProposal,
  createMicroDAOCmd,
  depositMicroDAOCmd,
  dissentCmd,
  executeFundingProposalCmd,
  upgradeDAO,
} from "../../utils/commands/micro-dao";
import { handleUpgradeDAO } from "./handleUpgradeDAO";

export const handleMicroDAO = async (interaction: CommandInteraction) => {
  const commandData = interaction.options.data;

  const subcommand = commandData[0];

  if (!subcommand) {
    return;
  }

  try {
    switch (subcommand.name) {
      case createMicroDAOCmd.name:
        await handleCreateMicroDAO(subcommand, interaction);
        break;
      case depositMicroDAOCmd.name:
        await handleDepositMicroDAO(subcommand, interaction);
        break;
      case createFundingProposal.name:
        await handleCreateFundingProposal(subcommand, interaction);
        break;
      case executeFundingProposalCmd.name:
        await handleExecuteFundingProposal(subcommand, interaction);
        break;
      case buildGetFundingProposalCmd.name:
        await handleGetFundingProposal(subcommand, interaction);
        break;
      case buildSubscribe.name:
        await handleSubscribe(subcommand, interaction);
        break;
      case dissentCmd.name:
        await handleDissent(subcommand, interaction);
        break;
      case upgradeDAO.name:
        await handleUpgradeDAO(subcommand, interaction);
        break;
    }
  } catch (e) {
    console.log(`A micro dao error happened`, e);
  }
};
