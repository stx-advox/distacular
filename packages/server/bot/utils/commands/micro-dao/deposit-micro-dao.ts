import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { MicroDAO } from "../../../schemas/micro-dao";
import { getBNSName } from "../../getBNSName";
import { amountBuilder } from "../common-cmds";

export const getDAOChoices = async (memberAddress?: string) => {
  const DAOs = await MicroDAO.find(
    memberAddress ? { members: memberAddress } : {}
  ).exec();
  let existingDAOs = DAOs.filter((dao) => dao.contractAddress);
  let daoChoices: [daoName: string, daoContractAddress: string][] = [];
  for (let choice of existingDAOs) {
    const prefix = await getBNSName(choice.contractAddress!.split(".")[0]);
    const newDAOName = `${prefix}.${choice.name}`;
    daoChoices.push([newDAOName, choice.contractAddress!]);
  }
  return daoChoices;
};

export const buildDAOField = async () => {
  return new SlashCommandStringOption()
    .setName("micro-dao-name")
    .setDescription("Pick one of the DAOs")
    .addChoices(await getDAOChoices())
    .setRequired(true);
};

export const depositMicroDAOCmd = async () => {
  return (
    new SlashCommandSubcommandBuilder()
      .setName("deposit")
      .setDescription("Deposit or donate to a micro dao")
      // .addStringOption(await buildDAOField())
      .addNumberOption(amountBuilder)
  );
};
