import {
  CommandInteraction,
  CommandInteractionOption,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import {
  buildDAOSelect,
  getBNSFromInteraction,
  markSelected,
} from "./handleDepositMDAO";
import { Schema, model } from "mongoose";
import { client } from "../../client";
import { proposalSelect } from "../../templates/proposal-select";

const SELECT_DISSENT_DAO_PREFIX = `select-dissent-dao-`;
const SELECT_DISSENT_PROPOSAL_PREFIX = `select-dissent-proposal-`;

interface IDissentAction {
  contractId?: string;
  proposalId?: string;
}

const schema = new Schema<IDissentAction>({
  contractId: { type: String, required: false },
  proposalId: { type: String, required: false },
});

const DissentAction = model<IDissentAction>("DissentAction", schema);

export const handleDissent = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }

  const action = new DissentAction();

  await action.save();
  interaction.editReply({
    content: `Please Select the DAO, to get a list of pending proposals`,
    components: [
      await buildDAOSelect(
        action.id,
        userAddress.address,
        SELECT_DISSENT_DAO_PREFIX
      ),
    ],
  });
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_DISSENT_DAO_PREFIX)
  ) {
    const dissentId = interaction.customId.replace(
      SELECT_DISSENT_DAO_PREFIX,
      ""
    );

    const action = await DissentAction.findById(dissentId).exec();
    if (!action) {
      return;
    }

    await interaction.deferUpdate();

    action.contractId = interaction.values[0];

    action.save();

    interaction.editReply({
      content: `Now select the proposal you want to dissent`,
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow
        ),
        await proposalSelect(
          interaction.values[0],
          false,
          `${SELECT_DISSENT_PROPOSAL_PREFIX}${dissentId}`
        ),
      ],
    });
  } else if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_DISSENT_PROPOSAL_PREFIX)
  ) {
    const dissentId = interaction.customId.replace(
      SELECT_DISSENT_PROPOSAL_PREFIX,
      ""
    );

    const action = await DissentAction.findById(dissentId).exec();
    if (!action) {
      return;
    }

    await interaction.deferUpdate();

    action.proposalId = interaction.values[0];

    await action.save();

    interaction.editReply({
      content: `Now select the proposal you want to dissent`,
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow,
          false,
          action.contractId
        ),
        markSelected(
          interaction,
          interaction.message.components?.[1] as MessageActionRow,
          false,
          action.proposalId
        ),

        new MessageActionRow().addComponents([
          new MessageButton({
            style: "LINK",
            url: `${process.env.SITE_URL}/dissent-micro-dao/${action.contractId}/${action.proposalId}`,
            label: "Confirm Dissent Tx",
          }),
        ]),
      ],
    });
  }
});
