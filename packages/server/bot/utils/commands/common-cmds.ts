import { SlashCommandNumberOption } from "@discordjs/builders";

export const amountBuilder = new SlashCommandNumberOption()
  .setName("amount")
  .setDescription("How much STX would you like to send from 1 to 1000 STX")
  .setMaxValue(1000)
  .setMinValue(1)
  .setRequired(true);
