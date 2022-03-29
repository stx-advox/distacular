import { Client, GuildMember, Intents } from "discord.js";

import { config } from "dotenv";

config();
import { connect } from "mongoose";
import { SendSTX } from "./schemas/tx";
import fetch from "cross-fetch";
const credentials = process.env.CERT_FILE_PATH;

interface INameResponse {
  address: string;
  blockchain: string;
  expire_block: number;
  last_txid: string;
  status: string;
  zonefile: string;
  zonefile_hash: string;
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("interactionCreate", async (interaction) => {
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
    const { options } = subcommand;

    const recipient = options!.find((item) => item.name === "recipient")!.user!;
    const amount = options!.find((item) => item.name === "amount")!;

    await interaction.deferReply({ ephemeral: true });

    const amountInuSTX = (amount.value as number) * 1e6;

    if (amount.value! > 1000 || amount.value! < 0.000001) {
      interaction.editReply({
        content: "You can't send more than 1000 or less than 0.000001 STX",
      });
      return;
    }

    const stacks = client.guilds.cache.get(process.env.GUILD_ID!)!;
    const member = await stacks.members.fetch(recipient);

    const name = member.nickname || recipient.username;

    const matchesBNS = /^\w{2,}\.\w{2,15}$/.test(name);

    if (!matchesBNS) {
      interaction.editReply({
        content: "User's name doesn't match the bns format",
      });
      return;
    }
    const res = await fetch(`${process.env.STACKS_URL}/v1/names/${name}`);

    const notFound = res.status === 404;
    if (notFound) {
      interaction.editReply({
        content: `Couldn't find a stx address with the name ${name}`,
      });
      return;
    } else if (res.status !== 200) {
      interaction.editReply({
        content: `Unknown error occurred will check it out tho dude`,
      });
      return;
    }

    const data: INameResponse = await res.json();

    const tx = new SendSTX({
      recipient: data.address,
      amount: amountInuSTX,
    });
    await tx.save();
    interaction.editReply({
      content: `Go to ${process.env.SITE_URL}/send-stx/${tx.id} to send ${amount.value} STX to ${name}`,
    });
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
