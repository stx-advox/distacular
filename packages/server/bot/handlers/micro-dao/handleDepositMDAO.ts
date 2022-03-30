import { CommandInteractionOption, CommandInteraction } from "discord.js";
import { checkSTXAmount } from "../send-stx";

export const handleDepositMicroDAO = (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const options = subcommand.options!;

  const daoContract = options.find((item) => item.name === "micro-dao-name")!
    .value as string;
  const amount = options.find((item) => item.name === "amount")!
    .value as number;
  if (checkSTXAmount(amount, interaction)) {
    return null;
  }

  interaction.editReply({
    content: `Go to ${process.env.SITE_URL}/deposit-micro-dao/${daoContract}/${
      amount * 1e6
    }`,
  });
};
