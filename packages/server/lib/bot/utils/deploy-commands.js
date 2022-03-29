"use strict";
exports.__esModule = true;
var builders_1 = require("@discordjs/builders");
var rest_1 = require("@discordjs/rest");
var v9_1 = require("discord-api-types/v9");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var commands = [
    new builders_1.SlashCommandBuilder()
        .setName("distacular")
        .setDescription("Use to interact with stacks through your discord")
        .addSubcommand(function (input) {
        return input
            .setName("send_stx")
            .setDescription("Send STX tokens to a discord user with a .btc name")
            .addNumberOption(function (input) {
            return input
                .setName("amount")
                .setDescription("How much STX would you like to send from 0.000001 to 1000 STX")
                .setMaxValue(1000)
                .setMinValue(0.000001)
                .setRequired(true);
        })
            .addStringOption(function (input) {
            return input
                .setName("recipient")
                .setDescription("BNS name or STX address of recipient")
                .setRequired(true);
        });
    }),
].map(function (command) { return command.toJSON(); });
var rest = new rest_1.REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);
rest
    .put(v9_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(function () { return console.log("Successfully registered application commands."); })["catch"](console.error);
