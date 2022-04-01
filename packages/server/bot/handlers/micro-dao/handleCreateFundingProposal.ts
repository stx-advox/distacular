import { MicroDAO } from "../../schemas/micro-dao";
import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import {
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
} from "discord.js";
import { FundingProposal } from "../../schemas/funding-proposal";

export const handleCreateFundingProposal = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const daoContract = subcommand.options!.find(
    (item) => item.name === "micro-dao-name"
  )!.value as string;

  const memo = subcommand.options!.find(
    (item) => item.name === "funding-proposal-description"
  )!.value as string;

  if (memo.length > 50) {
    return interaction.editReply({
      content: "Description length must not exceed 50 characters!",
    });
  }

  const granteesMap = subcommand.options!.reduce((acc, option) => {
    if (option.name.startsWith("grantee")) {
      return {
        ...acc,
        [option.name]: {
          grantee:
            (option.member! as GuildMember).nickname || option.user!.username,
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
          amount: option.value! as number,
        },
      };
    }
    return acc;
  }, {} as { [x: string]: { grantee: string; amount: number } });

  const addressesAmounts: [bnsName: string, amount: number][] = [];

  for (let { grantee, amount } of Object.values(granteesMap)) {
    const data = await getNameAddressWithErrorHandling(grantee, interaction);
    if (!data) {
      return;
    }

    const amountInuSTX = Math.floor(amount * 1e6);
    addressesAmounts.push([data.address, amountInuSTX]);

    const fundingProposal = new FundingProposal();
    fundingProposal.daoContractAddress = daoContract;
    fundingProposal.grants = addressesAmounts;
    fundingProposal.memo = memo;
    await fundingProposal.save();
    await interaction.editReply({
      content: `Go to ${process.env.SITE_URL}/create-funding-proposal/${fundingProposal.id} to submit the tx to the stacks blockchain!`,
    });
  }
};
