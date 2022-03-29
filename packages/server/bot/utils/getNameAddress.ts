import fetch from "cross-fetch";
import { CommandInteraction } from "discord.js";

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
  interaction: CommandInteraction
) => {
  const res = await fetch(`${process.env.STACKS_URL}/v1/names/${name}`);

  const notFound = res.status === 404;
  if (notFound) {
    interaction.editReply({
      content: `Couldn't find a stx address with the name ${name}`,
    });
    return null;
  } else if (res.status !== 200) {
    interaction.editReply({
      content: `Unknown error occurred will check it out tho dude`,
    });
    return null;
  }

  const data: INameResponse = await res.json();
  return data;
};
