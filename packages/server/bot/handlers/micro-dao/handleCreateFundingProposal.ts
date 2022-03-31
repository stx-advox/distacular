import { MicroDAO } from "../../schemas/micro-dao";
import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import {
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
} from "discord.js";

export const handleCreateFundingProposal = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
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
    addressesAmounts.push([grantee, amount]);
  }
  interaction.editReply({ content: "Got it dude!" });

  console.log(granteesMap);
};
