import { Configuration, NamesApi } from "@stacks/blockchain-api-client";
import fetch from "cross-fetch";
import { CommandInteraction, SelectMenuInteraction } from "discord.js";

interface INameResponse {
  address: string;
  blockchain: string;
  expire_block: number;
  last_txid: string;
  status: string;
  zonefile: string;
  zonefile_hash: string;
}

// I know... i hate myself
export const getNameAddressWithErrorHandling = async (
  name: string,
  interaction: CommandInteraction | SelectMenuInteraction
) => {
  const namesAPI = new NamesApi(
    new Configuration({
      fetchApi: fetch,
      basePath: process.env.STACKS_URL,
    })
  );
  const res = await namesAPI.getNameInfo({ name });

  const notFound = !res.address;
  if (notFound) {
    interaction.editReply({
      content: `Couldn't find a stx address with the name ${name}`,
    });
    return null;
  }

  return res;
};
