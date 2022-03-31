import { SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { createMicroDAOCmd } from "./create-micro-dao-cmd";
import { depositMicroDAOCmd } from "./deposit-micro-dao";

export const microDAOCmd = async () => {
  const depositCmd = await depositMicroDAOCmd();

  return new SlashCommandSubcommandGroupBuilder()
    .setName("micro-dao")
    .setDescription(
      "The mDAO contract interface offers all the options to create and manage micro mDAOs"
    )
    .addSubcommand(createMicroDAOCmd)
    .addSubcommand(depositCmd);
};
