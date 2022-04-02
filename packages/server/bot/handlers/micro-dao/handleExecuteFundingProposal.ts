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

const SELECT_EXECUTE_DAO_PREFIX = `select-execute-dao-`;
const SELECT_EXECUTE_PROPOSAL_PREFIX = `select-execute-proposal-`;

interface IExecuteFundingProposalAction {
  contractId?: string;
  proposalId?: string;
}

const schema = new Schema<IExecuteFundingProposalAction>({
  contractId: { type: String, required: false },
  proposalId: { type: String, required: false },
});

const ExecuteFundingProposalAction = model<IExecuteFundingProposalAction>(
  "ExecuteFundingProposalAction",
  schema
);

export const handleExecuteFundingProposal = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }

  const action = new ExecuteFundingProposalAction();

  await action.save();
  interaction.editReply({
    content: `Please Select the DAO, to get a list of pending proposals`,
    components: [
      await buildDAOSelect(
        action.id,
        userAddress.address,
        SELECT_EXECUTE_DAO_PREFIX
      ),
    ],
  });
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_EXECUTE_DAO_PREFIX)
  ) {
    const executeId = interaction.customId.replace(
      SELECT_EXECUTE_DAO_PREFIX,
      ""
    );

    const action = await ExecuteFundingProposalAction.findById(
      executeId
    ).exec();
    if (!action) {
      return;
    }

    await interaction.deferUpdate();

    action.contractId = interaction.values[0];

    action.save();

    interaction.editReply({
      content: `Now select the proposal you want to execute`,
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow
        ),
        await proposalSelect(
          interaction.values[0],
          (proposal) => proposal.isPastDissent && proposal.status === 0,
          `${SELECT_EXECUTE_PROPOSAL_PREFIX}${executeId}`
        ),
      ],
    });
  } else if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_EXECUTE_PROPOSAL_PREFIX)
  ) {
    const executeId = interaction.customId.replace(
      SELECT_EXECUTE_PROPOSAL_PREFIX,
      ""
    );

    const action = await ExecuteFundingProposalAction.findById(
      executeId
    ).exec();
    if (!action) {
      return;
    }

    await interaction.deferUpdate();

    action.proposalId = interaction.values[0];

    await action.save();

    interaction.editReply({
      content: `Now select the proposal you want to execute`,
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
            url: `${process.env.SITE_URL}/execute-funding-proposal/${action.contractId}/${action.proposalId}`,
            label: "Confirm Execute Tx",
          }),
        ]),
      ],
    });
  }
});
