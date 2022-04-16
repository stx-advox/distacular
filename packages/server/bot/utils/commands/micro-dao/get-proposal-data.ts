import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export const buildGetFundingProposalCmd = new SlashCommandSubcommandBuilder()
  .setName("get-proposal-data")
  .setDescription("Get the info of a certain proposal");
