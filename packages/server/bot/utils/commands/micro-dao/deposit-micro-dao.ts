import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { MicroDAO } from "../../../schemas/micro-dao";
import { getBNSName } from "../../getBNSName";
import { amountBuilder } from "../common-cmds";

export const depositMicroDAOCmd = async () => {
  const DAOs = await MicroDAO.find({}).exec();
  let existingDAOs = DAOs.filter((dao) => dao.contractAddress);
  let daoChoices: [name: string, value: string][] = [];
  for (let choice of existingDAOs) {
    const prefix = await getBNSName(choice.contractAddress!.split(".")[0]);
    const newDAOName = `${prefix}.${choice.name}`;
    daoChoices.push([newDAOName, choice.contractAddress!]);
  }
  return (input: SlashCommandSubcommandBuilder) => {
    return input
      .setName("deposit")
      .setDescription("Deposit or donate to a micro dao")
      .addStringOption((input) =>
        input
          .setName("micro-dao-name")
          .setDescription("Pick one of the DAOs")
          .addChoices(daoChoices)
          .setRequired(true)
      )
      .addNumberOption(amountBuilder);
  };
};
