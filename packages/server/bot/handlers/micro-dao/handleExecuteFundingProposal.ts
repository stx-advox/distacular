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
import { client } from "../../client";
import { proposalSelect } from "../../templates/proposal-select";

const SELECT_EXECUTE_DAO_PREFIX = `select-execute-dao-`;
const SELECT_EXECUTE_PROPOSAL_PREFIX = `select-execute-proposal-`;

export const handleExecuteFundingProposal = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }
  interaction.editReply({
    content: `Please Select the DAO, to get a list of pending proposals`,
    components: [
      await buildDAOSelect("", userAddress.address, SELECT_EXECUTE_DAO_PREFIX),
    ],
  });
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_EXECUTE_DAO_PREFIX)
  ) {
    await interaction.deferUpdate();

    const contractId = interaction.values[0];

    interaction.editReply({
      content: `Now select the proposal`,
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow
        ),
        await proposalSelect(
          interaction.values[0],
          (proposal) => proposal.isPastDissent && proposal.status === 0,
          `${SELECT_EXECUTE_PROPOSAL_PREFIX}${contractId}`
        ),
      ],
    });
  } else if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_EXECUTE_PROPOSAL_PREFIX)
  ) {
    const contractId = interaction.customId.replace(
      SELECT_EXECUTE_PROPOSAL_PREFIX,
      ""
    );

    await interaction.deferUpdate();

    const proposalId = interaction.values[0];

    interaction.editReply({
      content: interaction.message.content,
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow,
          false,
          contractId
        ),
        markSelected(
          interaction,
          interaction.message.components?.[1] as MessageActionRow,
          false,
          proposalId
        ),

        new MessageActionRow().addComponents([
          new MessageButton({
            style: "LINK",
            url: `${process.env.SITE_URL}/execute-funding-proposal/${contractId}/${proposalId}`,
            label: "Confirm Execute Tx",
          }),
        ]),
      ],
    });
  }
});
