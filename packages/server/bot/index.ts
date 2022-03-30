import { Client, Intents, Interaction } from "discord.js";

import { config } from "dotenv";

config();
import { handleMicroDAO } from "./handlers/micro-dao";

import { handleSendSTX } from "./handlers/send-stx";
import { deployCommands } from "./utils/deploy-commands";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("interactionCreate", async (interaction: Interaction) => {
  if (
    !interaction.isCommand() ||
    interaction.commandName !== process.env.COMMAND_NAME ||
    interaction.guildId !== process.env.GUILD_ID!
  ) {
    return;
  }

  const commandData = interaction.options.data;

  const subcommand = commandData[0];

  await interaction.deferReply({ ephemeral: true });

  if (process.env.NODE_ENV === "production" && subcommand.name === "send_stx") {
    handleSendSTX(interaction);
  } else if (subcommand.name === "micro-dao") {
    handleMicroDAO(interaction);
  } else {
    interaction.reply({
      ephemeral: true,
      content: "Got it!!",
    });
  }
});

client.on("guildCreate", async (guild) => {
  await deployCommands(guild.id);
});
