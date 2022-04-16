import { DAOSubscription } from "../../schemas/DAOSubscription";
import {
  CommandInteraction,
  CommandInteractionOption,
  Permissions,
} from "discord.js";
import { buildDAOSelect, getBNSFromInteraction } from "./handleDepositMDAO";
import { client } from "../../client";

const SELECT_DAO_SUB_PREFIX = `select-subscribe-dao-`;
export const handleSubscribe = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const options = subcommand.options;

  if (!options) {
    return;
  }

  const hasManageServerPerm = (
    interaction.member?.permissions as Permissions
  ).has(Permissions.FLAGS.MANAGE_GUILD);

  if (!hasManageServerPerm) {
    interaction.editReply({
      content: `You must have Manage Server Permission to subscribe to a DAO`,
    });
    return;
  }

  const channel = options.find((option) => option.type === "CHANNEL");
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }

  if (channel) {
    interaction.editReply({
      content: `Select the DAO you wanna subscribe to`,
      embeds: [],
      components: [
        await buildDAOSelect(
          channel.channel?.id as string,
          userAddress.address,
          SELECT_DAO_SUB_PREFIX
        ),
      ],
    });
  }
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_DAO_SUB_PREFIX)
  ) {
    await interaction.deferUpdate();

    const contractId = interaction.values[0];
    const channelId = interaction.customId.replace(SELECT_DAO_SUB_PREFIX, "");

    const sub = new DAOSubscription({
      channelId,
      daoContractAddress: contractId,
      guildId: interaction.guild?.id,
    });

    await sub.save();

    interaction.editReply({
      content: `Subscribed to ${contractId} on <#${sub.channelId}>`,
    });
  }
});
