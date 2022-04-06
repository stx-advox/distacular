import { Configuration, NamesApi } from "@stacks/blockchain-api-client";
import fetch from "cross-fetch";
import { CommandInteraction, SelectMenuInteraction } from "discord.js";

const namesAPI = new NamesApi(
  new Configuration({
    fetchApi: fetch,
    basePath: process.env.REACT_APP_STACKS_URL,
  })
);
// I know... i hate myself
export const getNameAddressWithErrorHandling = async (
  name: string,
  interaction: CommandInteraction | SelectMenuInteraction
) => {
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

export const getBNSName = async (address: string) => {
  try {
    const data = await namesAPI.getNamesOwnedByAddress({
      address,
      blockchain: "stacks",
    });

    const firstName = data.names?.[0];
    return firstName || address;
  } catch (e) {
    console.log("getBNSName", e);
  }
  return address;
};
