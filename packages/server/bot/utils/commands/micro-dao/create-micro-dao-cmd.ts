import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
export const createMicroDAOCmd = (input: SlashCommandSubcommandBuilder) => {
  return input
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
      input.setName("member2").setDescription("2nd member").setRequired(false)
    )
    .addUserOption((input) =>
      input.setName("member3").setDescription("3rd member").setRequired(false)
    )
    .addUserOption((input) =>
      input.setName("member4").setDescription("4th member").setRequired(false)
    )
    .addUserOption((input) =>
      input.setName("member5").setDescription("5th member").setRequired(false)
    )
    .addUserOption((input) =>
      input.setName("member6").setDescription("6th member").setRequired(false)
    )
    .addUserOption((input) =>
      input.setName("member7").setDescription("7th member").setRequired(false)
    );
};
