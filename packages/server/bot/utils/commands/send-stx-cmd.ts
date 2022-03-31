import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { amountBuilder } from "./common-cmds";

export const sendSTXCmd = (input: SlashCommandSubcommandBuilder) =>
  input
    .setName("send_stx")
    .setDescription("Send STX tokens to a discord user with a .btc name")
    .addNumberOption(amountBuilder)
    .addUserOption((input) =>
      input
        .setName("recipient")
        .setDescription("BNS name or STX address of recipient")
        .setRequired(true)
    );
