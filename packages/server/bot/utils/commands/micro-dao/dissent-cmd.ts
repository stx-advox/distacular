import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export const dissentCmd = new SlashCommandSubcommandBuilder()
  .setName("dissent")
  .setDescription("Dissent on funding proposal");
