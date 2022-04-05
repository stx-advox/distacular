import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { microDAOCmd } from "./commands/micro-dao";
import { sendSTXCmd } from "./commands/send-stx-cmd";
import { connectDB } from "./connect-db";

config();
export const deployCommands = async (guild: string = process.env.GUILD_ID!) => {
  await connectDB();

  const commands = [sendSTXCmd, await microDAOCmd()].map((command) =>
    command.toJSON()
  );

  const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, guild),
      { body: commands }
    );
    return console.log("Successfully registered application commands.");
  } catch (error) {
    return console.error(JSON.stringify(error));
  }
};
