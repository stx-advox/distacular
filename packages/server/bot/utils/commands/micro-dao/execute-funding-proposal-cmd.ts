import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export const buildExecuteFundingProposalCmd = async () => {
  return new SlashCommandSubcommandBuilder()
    .setName("execute-funding-proposal")
    .setDescription("ExecuteFundingProposal on funding proposal");
};
