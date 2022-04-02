import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export const buildExecuteFundingProposalCmd = async () => {
  return new SlashCommandSubcommandBuilder()
    .setName("execute-funding-proposal")
    .setDescription(
      "Execute a funding proposal that has been created at least 5 days and had no dissent"
    );
};
