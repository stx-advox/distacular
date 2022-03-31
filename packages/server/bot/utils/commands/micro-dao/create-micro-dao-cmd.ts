import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

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
  );

addMultipleUserOptions(createMicroDAOCmd, 1, 7);

export { createMicroDAOCmd, addMultipleUserOptions };
