import { connectWebSocketClient } from "@stacks/blockchain-api-client";
import { DAOSubscription } from "../schemas/DAOSubscription";
import { Client, MessageEmbed, TextChannel } from "discord.js";
import { getBNSName } from "./getNameAddress";

export const listenToDAOEvents = (client: Client) => {
  client.on("ready", async () => {
    const socket = await connectWebSocketClient(
      process.env.REACT_APP_STACKS_URL
    );

    socket.subscribeMempool(async (event) => {
      if (event.tx_type === "contract_call") {
        const contract = event.contract_call;
        const [matchingDAO] = await DAOSubscription.find({
          daoContractAddress: contract.contract_id,
        }).exec();

        if (!matchingDAO) {
          return;
        }

        const { guildId, channelId } = matchingDAO;

        const guild = await client.guilds.fetch(guildId);

        if (!guild) {
          return;
        }

        const channel = guild.channels.cache.get(channelId) as TextChannel;

        if (!channel) {
          return;
        }

        const name = await getBNSName(event.sender_address);

        const content = {
          author: {
            name,
          },
          description: `${name} has sent a ${
            contract.function_name
          } tx to the ${contract.contract_id.split(".")[1]} mDAO`,
          title: "Check Tx here",
          url: `https://explorer.stacks.co/txid/${event.tx_id}?chain=mainnet`,
        };
        const embed = new MessageEmbed(content);

        channel.send({ embeds: [embed] });
      }
    });
  });
};
