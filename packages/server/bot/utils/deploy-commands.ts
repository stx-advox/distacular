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
        .addStringOption((input) =>
          input
            .setName("recipient")
            .setDescription("BNS name or STX address of recipient")
            .setRequired(true)
        )
    ),
  new SlashCommandBuilder()
    .setName("distacular-dev")
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
  .catch(console.error);
