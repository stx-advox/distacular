import { Client, GuildMember, Intents, Interaction } from "discord.js";

import { config } from "dotenv";

config();
import { connect } from "mongoose";

import { handleSendSTX } from "./handlers/send-stx";
const credentials = process.env.CERT_FILE_PATH;

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

  if (subcommand.name === "send_stx") {
    handleSendSTX(interaction);
  }
});

export async function run() {
  try {
    await connect(process.env.MONGO_URI!, {
      sslKey: credentials,
      sslCert: credentials,
    });
    console.log("connected!");
    // perform actions using client
  } catch (e) {
    console.log(e);
    // Ensures that the client will close when you finish/error
  }
}
