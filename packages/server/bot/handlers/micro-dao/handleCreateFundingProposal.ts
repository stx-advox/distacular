import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import {
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
} from "discord.js";
import { FundingProposal } from "../../schemas/funding-proposal";

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
  const daoContract = getOption(subcommand, "micro-dao-name");

  const memo = getOption(subcommand, "funding-proposal-description");
  if (typeof memo === "string" && memo.length > 50) {
    return interaction.editReply({
      content: "Description length must not exceed 50 characters!",
    });
  }

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

  const addressesAmounts: [bnsName: string, amount: number][] = [];

  for (const { grantee, amount } of Object.values(granteesMap)) {
    const data = await getNameAddressWithErrorHandling(grantee, interaction);
    if (!data) {
      return;
    }

    const amountInuSTX = Math.floor(amount * 1e6);
    addressesAmounts.push([data.address, amountInuSTX]);

    const fundingProposal = new FundingProposal();
    fundingProposal.daoContractAddress = String(daoContract);
    fundingProposal.grants = addressesAmounts;
    fundingProposal.memo = String(memo);
    await fundingProposal.save();
    await interaction.editReply({
      content: `Go to ${process.env.SITE_URL}/create-funding-proposal/${fundingProposal.id} to submit the tx to the stacks blockchain!`,
    });
  }
};
