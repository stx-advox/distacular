import { SendSTX } from "../schemas/tx";
import { CommandInteraction } from "discord.js";
import { getNameAddressWithErrorHandling } from "../utils/getNameAddress";
import { tokenList } from "@distacular/common";

export const checkTokenAmount = (
  amount: number,
  tokenContractAddress: string,
  interaction: CommandInteraction
) => {
  const tokenData =
    tokenList.find((token) =>
      token.fullAddresses[0].startsWith(tokenContractAddress)
    ) || tokenList[0];
  const minValue = Number(`1e-${tokenData.scale}`);
  if (amount > 10000 || amount < minValue) {
    return interaction.editReply({
      content: `You can't send more than 10000 or less than ${minValue.toFixed(
        tokenData.scale
      )} ${tokenData.name}`,
    });
  }
};

export const handleSendSTX = async (interaction: CommandInteraction) => {
  const commandData = interaction.options.data;

  const subcommand = commandData[0];
  const { options } = subcommand;

  const recipient = options!.find((item) => item.name === "recipient")!.user!;
  const amount = options!.find((item) => item.name === "amount")!;

  const amountInuSTX = (amount.value as number) * 1e6;

  if (
    checkTokenAmount(
      amount!.value as number,
      tokenList[0].fullAddresses[0],
      interaction
    )
  ) {
    return null;
  }

  const guild = interaction.guild!;
  const member = await guild.members.fetch(recipient);

  const name = member.nickname || recipient.username;

  const matchesBNS = /^\w{2,}\.\w{2,15}$/.test(name);

  if (!matchesBNS) {
    interaction.editReply({
      content: "User's name doesn't match the bns format",
    });
    return null;
  }
  const data = await getNameAddressWithErrorHandling(name, interaction);

  if (data) {
    const tx = new SendSTX({
      recipient: data.address,
      amount: amountInuSTX,
    });
    await tx.save();
    interaction.editReply({
      content: `Go to ${process.env.SITE_URL}/send-stx/${tx.id} to send ${amount.value} STX to ${name}`,
    });
  }
};
