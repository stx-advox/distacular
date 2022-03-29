import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";

config();
const commands = [
  new SlashCommandBuilder()
    .setName("distacular")
    .setDescription("Use to interact with stacks through your discord")
    .addSubcommand((input) =>
      input
        .setName("send_stx")
        .setDescription("Send STX tokens to a discord user with a .btc name")
        .addNumberOption((input) =>
          input
            .setName("amount")
            .setDescription(
              "How much STX would you like to send from 0.000001 to 1000 STX"
            )
            .setMaxValue(1000)
            .setMinValue(0.000001)
            .setRequired(true)
        )
        .addUserOption((input) =>
          input
            .setName("recipient")
            .setDescription("BNS name or STX address of recipient")
            .setRequired(true)
        )
    )
    .addSubcommandGroup((input) =>
      input
        .setName("micro-dao")
        .setDescription(
          "The mDAO contract interface offers all the options to create and manage micro mDAOs"
        )
        .addSubcommand((input) =>
          input
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
                .setName("member2")
                .setDescription("2nd member")
                .setRequired(false)
            )
            .addUserOption((input) =>
              input
                .setName("member3")
                .setDescription("3rd member")
                .setRequired(false)
            )
            .addUserOption((input) =>
              input
                .setName("member4")
                .setDescription("4th member")
                .setRequired(false)
            )
            .addUserOption((input) =>
              input
                .setName("member5")
                .setDescription("5th member")
                .setRequired(false)
            )
            .addUserOption((input) =>
              input
                .setName("member6")
                .setDescription("6th member")
                .setRequired(false)
            )
            .addUserOption((input) =>
              input
                .setName("member7")
                .setDescription("7th member")
                .setRequired(false)
            )
        )
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(
  process.env.DISCORD_BOT_TOKEN!
);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID!,
      process.env.GUILD_ID!
    ),
    { body: commands }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch((error) => console.error(JSON.stringify(error)));
