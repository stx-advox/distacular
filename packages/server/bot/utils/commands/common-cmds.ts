import { SlashCommandNumberOption } from "@discordjs/builders";

export const amountBuilder = (input: SlashCommandNumberOption) => {
  return input
    .setName("amount")
    .setDescription(
      "How much STX would you like to send from 0.000001 to 1000 STX"
    )
    .setMaxValue(1000)
    .setMinValue(0.000001)
    .setRequired(true);
};
