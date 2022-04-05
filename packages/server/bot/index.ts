import { Interaction } from "discord.js";

import { config } from "dotenv";
import { client } from "./client";

config();
import { handleMicroDAO } from "./handlers/micro-dao";

import { handleSendSTX } from "./handlers/send-stx";
import { deployCommands } from "./utils/deploy-commands";

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  await interaction.deferReply({ ephemeral: true });

  if (interaction.commandName === "send-stx") {
    handleSendSTX(interaction);
  } else if (interaction.commandName === "micro-dao") {
    handleMicroDAO(interaction);
  }
});

client.on("guildCreate", async (guild) => {
  await deployCommands(guild.id);
});
