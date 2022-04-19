import {
  BnsGetNameInfoResponse,
  Configuration,
  NamesApi,
} from "@stacks/blockchain-api-client";
import fetch from "cross-fetch";
import { CommandInteraction, SelectMenuInteraction } from "discord.js";

const namesAPI = new NamesApi(
  new Configuration({
    fetchApi: fetch,
    basePath: process.env.STACKS_URL,
  })
);
// I know... i hate myself
export const getNameAddressWithErrorHandling = async (
  name: string,
  interaction: CommandInteraction | SelectMenuInteraction
) => {
  let res: BnsGetNameInfoResponse;
  const respondWithError = () => {
    const content = `Couldn't find a stx address with the name ${name}, change that name to a BNS name to continue`;
    interaction.editReply({
      content,
    });
    return null;
  };
  if (name.split(".").length < 2) {
    return respondWithError();
  }
  try {
    res = await namesAPI.getNameInfo({ name });
    const notFound = !res.address;
    if (notFound) {
      return respondWithError();
    }
  } catch (e) {
    return respondWithError();
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
