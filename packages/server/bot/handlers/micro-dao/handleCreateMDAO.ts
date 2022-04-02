import { MicroDAO } from "../../schemas/micro-dao";
import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import {
  CommandInteraction,
  CommandInteractionOption,
  GuildMember,
} from "discord.js";

export const handleCreateMicroDAO = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const name = subcommand.options?.find((option) => option.name === "name")
    ?.value as string;

  const members = [
    interaction.member as GuildMember,
    ...(subcommand.options
      ?.filter(
        (option) => option.type === "USER" && /^member\d$/.test(option.name)
      )
      .map((option) => option.member) as GuildMember[]),
  ];

  if (!/[\w-]{3,50}/.test(name)) {
    return interaction.editReply({
      content: "Yo! letters, numbers and dashes only! like hz-dao or something",
    });
  }

  const memberNames = members.map(
    (member) => member.nickname || member.user.username
  );

  const allNamesAreBNSValid = memberNames.every((memberName) => {
    return /^[a-z]{2,40}\.[a-z]{2,40}$/.test(memberName);
  });

  if (!allNamesAreBNSValid) {
    return interaction.editReply({
      content:
        "Please check that all the members have a valid bns name (e.g. hz.btc) as their server nickname or discord username",
    });
  }

  const memberAddresses: string[] = [];

  for (const member of memberNames) {
    const data = await getNameAddressWithErrorHandling(member, interaction);
    if (!data) {
      return;
    }
    memberAddresses.push(data.address);
  }

  const mDAO = new MicroDAO({ name, members: memberAddresses });
  await mDAO.save();

  interaction.editReply({
    content: `Go to ${process.env.SITE_URL}/create-micro-dao/${
      mDAO.id
    } to create the ${name} mDAO with ${members
      .map((m) => `<@${m.user.id}>`)
      .join(" ")} as initial members`,
  });
};
