import {
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "@discordjs/builders";
import { tokenSelectBuilder } from "./deposit-micro-dao";

const createMultipleUserAmountPairs = (cmd: SlashCommandSubcommandBuilder) => {
  for (let i = 1; i <= 10; i += 1) {
    cmd
      .addUserOption(
        new SlashCommandUserOption()
          .setName(`grantee${i}`)
          .setDescription(`grantee ${i}`)
          .setRequired(i === 1)
      )
      .addNumberOption(
        new SlashCommandNumberOption()
          .setName(`amount${i}`)
          .setDescription(`The grant amount for grantee #${i}`)
          .setRequired(i === 1)
      );
  }
};

const buildFundingProposal = () => {
  const cmd = new SlashCommandSubcommandBuilder()
    .setName("create-funding-proposal")
    .setDescription(
      "Create a proposal to send money to one or more people (at least one at most 10)"
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("funding-proposal-description")
        .setDescription(
          "A short sentence or preferably a link to the details of the funding proposal"
        )
        .setRequired(true)
    )
    .addStringOption(tokenSelectBuilder);
  createMultipleUserAmountPairs(cmd);
  return cmd;
};

const createFundingProposal = buildFundingProposal();

const upgradeDAO = new SlashCommandSubcommandBuilder()
  .setName("upgrade-dao")
  .setDescription(
    "Upgrade the DAO to a new version, and transfer assets to the new DAO"
  );

export { createFundingProposal, upgradeDAO };
