import { buildSubscribe } from "../../utils/commands/micro-dao/subscribe-to-dao";
import { CommandInteraction } from "discord.js";
import { handleCreateFundingProposal } from "./handleCreateFundingProposal";
import { handleCreateMicroDAO } from "./handleCreateMDAO";
import { handleDepositMicroDAO } from "./handleDepositMDAO";
import { handleDissent } from "./handleDissent";
import { handleExecuteFundingProposal } from "./handleExecuteFundingProposal";
import { handleGetFundingProposal } from "./handleGetProposal";
import { handleSubscribe } from "./handleSubscribe";

export const handleMicroDAO = async (interaction: CommandInteraction) => {
  const commandData = interaction.options.data;

  const subcommand = commandData[0];

  if (!subcommand) {
    return;
  }

  try {
    if (subcommand.name === "create") {
      await handleCreateMicroDAO(subcommand, interaction);
    } else if (subcommand.name === "deposit") {
      await handleDepositMicroDAO(subcommand, interaction);
    } else if (subcommand.name === "create-funding-proposal") {
      await handleCreateFundingProposal(subcommand, interaction);
    } else if (subcommand.name === "dissent") {
      await handleDissent(subcommand, interaction);
    } else if (subcommand.name === "execute-funding-proposal") {
      await handleExecuteFundingProposal(subcommand, interaction);
    } else if (subcommand.name === "get-proposal-data") {
      await handleGetFundingProposal(subcommand, interaction);
    } else if (subcommand.name === buildSubscribe.name) {
      await handleSubscribe(subcommand, interaction);
    }
  } catch (e) {
    console.log(`A micro dao error happened`, e);
  }
};
