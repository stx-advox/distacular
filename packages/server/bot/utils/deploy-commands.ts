import {
  SlashCommandBuilder,
  SlashCommandNumberOption,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { MicroDAO } from "../schemas/micro-dao";
import { createMicroDAOCmd } from "./commands/create-micro-dao-cmd";
import { connectDB } from "./connect-db";

const amountBuilder = (input: SlashCommandNumberOption) => {
  return input
    .setName("amount")
    .setDescription(
      "How much STX would you like to send from 0.000001 to 1000 STX"
    )
    .setMaxValue(1000)
    .setMinValue(0.000001)
    .setRequired(true);
};

config();
export const deployCommands = async () => {
  await connectDB();

  MicroDAO.find({}, async (err, DAOs) => {
    if (err) {
      return;
    }

    const commands = [
      new SlashCommandBuilder()
        .setName("distacular")
        .setDescription("Use to interact with stacks through your discord")
        .addSubcommand((input) =>
          input
            .setName("send_stx")
            .setDescription(
              "Send STX tokens to a discord user with a .btc name"
            )
            .addNumberOption(amountBuilder)
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
            .addSubcommand(createMicroDAOCmd)
            .addSubcommand((input) =>
              input
                .setName("deposit")
                .setDescription("Deposit or donate to a micro dao")
                .addStringOption((input) =>
                  input
                    .setName("micro-dao-name")
                    .setDescription("Pick one of the DAOs")
                    .addChoices(
                      DAOs.map((dao) => [dao.name, dao.contractAddress!])
                    )
                    .setRequired(true)
                )
                .addNumberOption(amountBuilder)
            )
        ),
    ].map((command) => command.toJSON());

    const rest = new REST({ version: "9" }).setToken(
      process.env.DISCORD_BOT_TOKEN!
    );

    try {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID!,
          process.env.GUILD_ID!
        ),
        { body: commands }
      );
      return console.log("Successfully registered application commands.");
    } catch (error) {
      return console.error(JSON.stringify(error));
    }
  });
};

deployCommands();
