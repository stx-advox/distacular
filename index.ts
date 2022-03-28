import {
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  serializePostCondition,
} from "@stacks/transactions";
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
    const res = await fetch(
      `${process.env.STACKS_URL}/v1/names/${member.nickname}`
    );
    const data: INameResponse = await res.json();

    const amountInuSTX = (amount.value as number) * 1e6;
    const tx = new SendSTX({
      recipient: recipient.value,
      amount: amountInuSTX,
      postConditions: [
        serializePostCondition(
          makeStandardSTXPostCondition(
            data.address,
            FungibleConditionCode.Equal,
            Number(amountInuSTX)
          )
        ),
      ],
    });
    await tx.save();
    interaction.editReply({
      content: `Sending ${amount.value} STX to ${recipient.value}`,
    });

    console.log(tx.id);
  }
});

async function run() {
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

run().catch(console.dir);
