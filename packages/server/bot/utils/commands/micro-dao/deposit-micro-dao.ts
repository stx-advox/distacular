import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { getBNSName } from "../../getNameAddress";
import { MicroDAO } from "../../../schemas/micro-dao";

import { amountBuilder } from "../common-cmds";
import { tokenList } from "@distacular/common";

export const getDAOChoices = async (memberAddress?: string) => {
  const DAOs = await MicroDAO.find(
    memberAddress
      ? {
          $or: [
            {
              $and: [
                {
                  contractAddress: { $ne: null },
                },
                { members: memberAddress },
              ],
            },
            {
              contractAddress: {
                $regex: memberAddress,
                $options: "i",
              },
            },
          ],
        }
      : { contractAddress: { $ne: null } }
  ).exec();
  const existingDAOs = DAOs.filter((dao) => dao.contractAddress);
  const daoChoices: [daoName: string, daoContractAddress: string][] = [];
  for (const choice of existingDAOs) {
    const prefix = await getBNSName(
      (choice.contractAddress as string).split(".")[0]
    );
    const newDAOName = `${prefix}.${choice.name}`;
    daoChoices.push([newDAOName, choice.contractAddress as string]);
  }
  return daoChoices;
};

export const tokenSelectBuilder = new SlashCommandStringOption()
  .setName("token")
  .setDescription("The token you wanna send")
  .setChoices(
    tokenList.map(
      (token) => [token.name, token.name] as [name: string, value: string]
    )
  )
  .setRequired(true);

export const depositMicroDAOCmd = new SlashCommandSubcommandBuilder()
  .setName("deposit")
  .setDescription("Deposit or donate to a micro dao")
  .addStringOption(tokenSelectBuilder)
  .addNumberOption(amountBuilder);
