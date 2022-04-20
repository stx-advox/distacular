import { SlashCommandNumberOption } from "@discordjs/builders";

export const amountBuilder = new SlashCommandNumberOption()
  .setName("amount")
  .setDescription("How much tokens would you like to send")
  .setRequired(true);
