import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export const buildDissentCmd = async () => {
  return new SlashCommandSubcommandBuilder()
    .setName("dissent")
    .setDescription("Dissent on funding proposal");
};
