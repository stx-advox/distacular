import {
  SlashCommandIntegerOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

const addMultipleUserOptions = (
  builder: SlashCommandSubcommandBuilder,
  start: number,
  end: number
) => {
  for (let i = start; i <= end; i += 1) {
    builder.addUserOption((input) =>
      input
        .setName(`member${i}`)
        .setDescription(`member${i}`)
        .setRequired(false)
    );
  }
};

const createMicroDAOCmd = new SlashCommandSubcommandBuilder()
  .setName("create")
  .setDescription("Create a mDAO on stacks")
  .addStringOption((input) =>
    input
      .setName("name")
      .setDescription(
        "mDAO name max 50 characters only letters dashes and numbers allowed 50 characters max"
      )
      .setRequired(true)
  )
  .addUserOption((input) =>
    input
      .setName("admin")
      .setDescription(
        "The admin can withdraw funds from the mDAO at any time typically the grantor"
      )
      .setRequired(true)
  )
  .addIntegerOption(
    new SlashCommandIntegerOption()
      .setName("dissent-period")
      .setDescription(
        "The period before the action becomes executable to give mDAO members a chance to dissent"
      )
      .setRequired(true)
      .addChoices(
        Array(5)
          .fill(["", 0])
          .map((_, index) => [
            `${index + 1} day${index ? "s" : ""}`,
            (index + 1) * 144,
          ])
      )
  );

addMultipleUserOptions(createMicroDAOCmd, 1, 7);

export { createMicroDAOCmd, addMultipleUserOptions };
