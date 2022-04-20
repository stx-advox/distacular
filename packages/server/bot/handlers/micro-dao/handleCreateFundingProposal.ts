import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import {
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { FundingProposal } from "../../schemas/funding-proposal";
import {
  getBNSFromInteraction,
  buildDAOSelect,
  markSelected,
} from "./handleDepositMDAO";
import { client } from "../../client";
import { tokenList } from "@distacular/common";
import { checkTokenAmount } from "../send-stx";

const SELECT_DAO_FP = `select-dao-fp-`;

const getOption = (subcommand: CommandInteractionOption, key: string) => {
  const options = subcommand.options;
  if (options) {
    const result = options.find((item) => item.name === key);
    if (result?.value) {
      return result.value;
    }
  }
};
export const handleCreateFundingProposal = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  if (!subcommand.options) {
    return;
  }

  const memo = getOption(subcommand, "funding-proposal-description") as string;
  if (memo.length > 50) {
    return interaction.editReply({
      content: "Description length must not exceed 50 characters!",
    });
  }

  const tokenName = getOption(subcommand, "token") as string;

  const details =
    tokenList.find((item) => item.name === tokenName) || tokenList[0];

  const tokenAddress = details.fullAddresses[0];

  let totalAmount = 0;

  const granteesMap = subcommand.options.reduce((acc, option) => {
    if (option.name.startsWith("grantee")) {
      if (!option.member || !option.user) {
        return acc;
      }
      return {
        ...acc,
        [option.name]: {
          grantee:
            (option.member as GuildMember).nickname || option.user.username,
          amount: 0,
        },
      };
    } else if (option.name.startsWith("amount")) {
      const grantNumber = option.name.replace("amount", "");
      const memberKey = `grantee${grantNumber}`;
      const oldData = acc[memberKey];

      totalAmount += Number(option.value);

      return {
        ...acc,
        [memberKey]: {
          ...oldData,
          amount: Number(option.value),
        },
      };
    }
    return acc;
  }, {} as { [x: string]: { grantee: string; amount: number } });

  if (checkTokenAmount(totalAmount, tokenAddress, interaction)) {
    return null;
  }

  const addressesAmounts: [bnsName: string, amount: number][] = [];

  for (const { grantee, amount } of Object.values(granteesMap)) {
    const data = await getNameAddressWithErrorHandling(grantee, interaction);
    if (!data) {
      return;
    }

    const amountInSmallestUnit = Math.floor(
      amount * Number(`1e${details.scale}`)
    );
    addressesAmounts.push([data.address, amountInSmallestUnit]);

    const fundingProposal = new FundingProposal();
    fundingProposal.grants = addressesAmounts;
    fundingProposal.tokenContractAddress = details.fullAddresses[0];

    fundingProposal.memo = memo;
    await fundingProposal.save();
    const userAddress = await getBNSFromInteraction(interaction);

    if (!userAddress) {
      return;
    }

    interaction.editReply({
      content: `Select the DAO you would deposit to from your DAOs`,
      components: [
        await buildDAOSelect(
          fundingProposal.id,
          userAddress.address,
          SELECT_DAO_FP
        ),
      ],
    });
  }
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_DAO_FP)
  ) {
    const fundingProposalId = interaction.customId.replace(SELECT_DAO_FP, "");

    await interaction.deferUpdate();
    const fundingProposal = await FundingProposal.findById(
      fundingProposalId
    ).exec();

    if (!fundingProposal) {
      return;
    }

    const contractId = interaction.values[0];

    fundingProposal.daoContractAddress = contractId;
    await fundingProposal.save();
    interaction.editReply({
      content: `Now select the proposal`,
      components: [
        markSelected(
          interaction,
          interaction.message.components?.[0] as MessageActionRow
        ),
        new MessageActionRow().addComponents([
          new MessageButton({
            style: "LINK",
            url: `${process.env.SITE_URL}/create-funding-proposal/${fundingProposal.id}`,
            label: "Confirm Funding Proposal Tx",
          }),
        ]),
      ],
    });
  }
});
