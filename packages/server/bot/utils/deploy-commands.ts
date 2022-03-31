import {
  SlashCommandBuilder,
  SlashCommandNumberOption,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { MicroDAO } from "../schemas/micro-dao";
import { amountBuilder } from "./commands/common-cmds";
import { microDAOCmd } from "./commands/micro-dao";
import { createMicroDAOCmd } from "./commands/micro-dao/create-micro-dao-cmd";
import { depositMicroDAOCmd } from "./commands/micro-dao/deposit-micro-dao";
import { sendSTXCmd } from "./commands/send-stx-cmd";
import { connectDB } from "./connect-db";
import { getBNSName } from "./getBNSName";

config();
export const deployCommands = async (guild: string = process.env.GUILD_ID!) => {
  await connectDB();

  const depositCmd = await depositMicroDAOCmd();

  const commands = [
    new SlashCommandBuilder()
      .setName("distacular")
      .setDescription("Use to interact with stacks through your discord")
      .addSubcommand(sendSTXCmd)
      .addSubcommandGroup(await microDAOCmd()),
  ].map((command) => command.toJSON());

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
