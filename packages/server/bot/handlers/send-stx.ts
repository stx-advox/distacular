import { SendSTX } from "../schemas/tx";
import fetch from "cross-fetch";
import { CommandInteraction } from "discord.js";
import { getNameAddressWithErrorHandling } from "../utils/getNameAddress";

export const handleSendSTX = async (interaction: CommandInteraction) => {
  const commandData = interaction.options.data;

  const subcommand = commandData[0];
  const { options } = subcommand;

  const recipient = options!.find((item) => item.name === "recipient")!.user!;
  const amount = options!.find((item) => item.name === "amount")!;

  const amountInuSTX = (amount.value as number) * 1e6;

  if (amount.value! > 1000 || amount.value! < 0.000001) {
    interaction.editReply({
      content: "You can't send more than 1000 or less than 0.000001 STX",
    });
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
