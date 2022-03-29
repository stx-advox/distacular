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
  if (!interaction.isCommand()) return;

  const commandData = interaction.options.data;

  const subcommand = commandData[0];

  if (subcommand.name === "send_stx") {
    const { options } = subcommand;

    const recipient = options!.find((item) => item.name === "recipient")!;
    const amount = options!.find((item) => item.name === "amount")!;
    const member = interaction.member as GuildMember;
    await interaction.deferReply({ ephemeral: true });
    let res;
    try {
      res = await fetch(
        `${process.env.STACKS_URL}/v1/names/${recipient.value}`
      );
    } catch (error) {
      const notFound = (error as Response).status === 404;
      if (notFound) {
        interaction.editReply({
          content: `Couldn't find a stx address with the name ${recipient.value}`,
        });
      } else {
        interaction.editReply({
          content: `Unknown error occurred will check it out tho dude`,
        });
      }
      console.log(error);
      return;
    }
    const data: INameResponse = await res.json();

    const amountInuSTX = (amount.value as number) * 1e6;

    if (amount.value! > 1000 || amount.value! < 0.000001) {
      interaction.editReply({
        content: "You can't send more than 1000 or less than 0.000001 STX",
      });
      return;
    }

    const tx = new SendSTX({
      recipient: data.address,
      amount: amountInuSTX,
    });
    await tx.save();
    interaction.editReply({
      content: `Go to ${process.env.SITE_URL}/send-stx/${tx.id} to send ${amount.value} STX to ${recipient.value}`,
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
