import { SlashCommandBuilder } from "@discordjs/builders";
import { createFundingProposal } from "./create-funding-proposal-cmd";
import { createMicroDAOCmd } from "./create-micro-dao-cmd";
import { depositMicroDAOCmd } from "./deposit-micro-dao";
import { buildDissentCmd } from "./dissent-cmd";
import { buildExecuteFundingProposalCmd } from "./execute-funding-proposal-cmd";
import { buildGetFundingProposalCmd } from "./get-proposal-data";

export const microDAOCmd = async () => {
  const depositCmd = await depositMicroDAOCmd();

  return new SlashCommandBuilder()
    .setName("micro-dao")
    .setDescription(
      "The mDAO contract interface offers all the options to create and manage micro mDAOs"
    )
    .addSubcommand(createMicroDAOCmd)
    .addSubcommand(depositCmd)
    .addSubcommand(await createFundingProposal())
    .addSubcommand(await buildDissentCmd())
    .addSubcommand(await buildExecuteFundingProposalCmd())
    .addSubcommand(await buildGetFundingProposalCmd());
};
