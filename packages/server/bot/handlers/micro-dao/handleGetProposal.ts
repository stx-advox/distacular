import {
  CommandInteraction,
  CommandInteractionOption,
  Guild,
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
import { getBNSName } from "../../utils/getNameAddress";
import { getProposal, infoApi, tokenList } from "@distacular/common";
import { MicroDAO } from "../../schemas/micro-dao";

const SELECT_GET_DAO_PREFIX = `select-get-dao-`;
const SELECT_GET_PROPOSAL_PREFIX = `select-get-proposal-`;

const ProposalStatus = ["Pending execution", "Passed", "Failed"];

const getBNSDiscordMember = async (guild: Guild, name: string) => {
  const results = await guild.members.search({ query: name });
  return results.find(
    (member) => member.nickname === name || member.user.username === name
  );
};

const mentionBNSUser = async (guild: Guild, name: string) => {
  const member = await getBNSDiscordMember(guild, name);

  return member ? `<@${member.user.id}>` : name;
};

export const handleGetFundingProposal = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }
  interaction.editReply({
    content: `Please Select the DAO, to get a list of pending proposals`,
    embeds: [],
    components: [
      await buildDAOSelect("", userAddress.address, SELECT_GET_DAO_PREFIX),
    ],
  });
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_GET_DAO_PREFIX)
  ) {
    const contractId = interaction.values[0];

    await interaction.deferUpdate();

    interaction.editReply({
      content: `Now select the proposal you want to check out`,
      embeds: [],
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow
        ),
        await proposalSelect(
          interaction.values[0],
          Boolean,
          `${SELECT_GET_PROPOSAL_PREFIX}${contractId}`
        ),
      ],
    });
  } else if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_GET_PROPOSAL_PREFIX)
  ) {
    await interaction.deferUpdate();

    const proposalId = interaction.values[0];

    const contractId = interaction.customId.replace(
      SELECT_GET_PROPOSAL_PREFIX,
      ""
    );
    const proposal = await getProposal(contractId, +proposalId);

    if (proposal) {
      const name = await mentionBNSUser(
        interaction.guild as Guild,
        await getBNSName(proposal.proposer)
      );

      const tokenInfo =
        tokenList.find((item) =>
          item.fullAddresses[0].startsWith(proposal["token-contract"])
        ) || tokenList[0];

      const targetsFormatted = await Promise.all(
        proposal.targets.map(
          async (item) =>
            `User: ${await mentionBNSUser(
              interaction.guild as Guild,
              await getBNSName(item.address)
            )} for a grant amount total of ${
              item.amount / 10 ** tokenInfo.scale
            } ${tokenInfo.name}`
        )
      );
      let description = `Proposer: ${name}
Targets:
${targetsFormatted.join("\n")}

Total: ${proposal["total-amount"] / 10 ** tokenInfo.scale} ${tokenInfo.name}

Info: ${proposal.memo}

Status: ${ProposalStatus[proposal.status]}

`;
      if (proposal.status === 0) {
        const { burn_block_height } = await infoApi.getCoreApiInfo();
        const [dao] = await MicroDAO.find({
          contractAddress: contractId,
        }).exec();

        const dissentPeriod = dao.dissentPeriod;

        if (!proposal.isPastDissent) {
          const remainingBlocks =
            proposal["created-at"] + dissentPeriod - burn_block_height;
          const estimatedTime = remainingBlocks * 10 * 60;
          const now = Math.floor(new Date().getTime() / 1000);
          const remainingTimeSection = `ETA until proposal can be executed: <t:${
            now + estimatedTime
          }:R>`;
          description += remainingTimeSection;
        }
      }
      const proposalIsExecutable =
        proposal.status === 0 && proposal.isPastDissent;
      const proposalIsDissentable =
        proposal.status === 0 && !proposal.isPastDissent;

      const components: MessageActionRow[] = [];

      if (proposalIsDissentable) {
        components.push(
          new MessageActionRow().addComponents([
            new MessageButton({
              url: `${process.env.SITE_URL}/dissent-micro-dao/${contractId}/${proposalId}`,
              label: `Dissent`,
              style: "LINK",
            }),
          ])
        );
      } else if (proposalIsExecutable) {
        components.push(
          new MessageActionRow().addComponents([
            new MessageButton({
              url: `${process.env.SITE_URL}/execute-funding-proposal/${contractId}/${proposalId}`,
              label: `Execute`,
              style: "LINK",
            }),
          ])
        );
      }
      interaction.editReply({
        components,
        content: "Proposal info",
        embeds: [
          {
            title: `Proposal #${proposalId}`,
            description,
            color: 0x008cff,
          },
        ],
      });
    }
  }
});
