import { REST } from "@discordjs/rest";
import { client } from "../client";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { microDAOCmd } from "./commands/micro-dao";

config();
export const deployCommands = async (
  guild: string = process.env.GUILD_ID as string
) => {
  const commands = [microDAOCmd].map((command) => command.toJSON());

  const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN as string
  );

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID as string, guild),
      { body: commands }
    );
    return console.log("Successfully registered application commands.");
  } catch (error) {
    return console.error(JSON.stringify(error));
  }
};

export const updateGuildsCmds = async () => {
  client.on("ready", async () => {
    const guilds = await client.guilds.fetch();
    for (const guild of guilds.values()) {
      await deployCommands(guild.id);
    }
  });
  client.login(process.env.DISCORD_BOT_TOKEN);
};
