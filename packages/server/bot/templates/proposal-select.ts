import {
  getProposal,
  IFormattedProposal,
  infoApi,
  tokenList,
} from "@distacular/common";
import { MessageActionRow, MessageSelectMenu } from "discord.js";

export const getDAOProposals = async (contractId: string) => {
  let proposalIndex = 0;
  let doneGettingProposals = false;

  const proposals: IFormattedProposal[] = [];

  const { burn_block_height } = await infoApi.getCoreApiInfo();

  while (!doneGettingProposals) {
    const formattedProposal = await getProposal(
      contractId,
      proposalIndex,
      burn_block_height
    );
    if (formattedProposal) {
      proposals.push(formattedProposal);
    }

    doneGettingProposals = !formattedProposal;

    proposalIndex++;
  }
  return proposals;
};

export const proposalSelect = async (
  contractId: string,
  filter: (proposal: IFormattedProposal) => boolean = () => true,
  custom_id = "",
  preSetValue = ""
) => {
  let proposals: IFormattedProposal[] = [];
  let placeholder = "Select proposal";
  try {
    proposals = await getDAOProposals(contractId);
  } catch (e) {
    console.log(e);
    placeholder = "Some error happened please try again!";
  }

  proposals = proposals.filter(filter);
  const actionRow = new MessageActionRow();

  let isDisabled = false;

  if (proposals.length === 0) {
    placeholder = "404!, use get-proposal-data to view all proposals";
    proposals = [
      {
        id: 12,
        "created-at": 0,
        "total-amount": 0,
        isPastDissent: false,
        "token-contract": "",
        memo: "",
        proposer: "",
        status: 0,
        targets: [],
      },
    ];
    isDisabled = true;
  }

  const tokenInfo =
    tokenList.find((item) =>
      item.fullAddresses[0].startsWith(proposals[0]["token-contract"])
    ) || tokenList[0];

  return actionRow.addComponents([
    new MessageSelectMenu()
      .setCustomId(custom_id)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(placeholder)
      .setOptions(
        proposals.map((p) => ({
          label: `Proposal #${p.id}`,
          description: `description: ${p.memo}, amount: ${
            p["total-amount"] / 10 ** tokenInfo.scale
          } ${tokenInfo.name}`,
          value: p.id.toString(),

          default: p.id.toString() === preSetValue,
        }))
      )
      .setDisabled(isDisabled),
  ]);
};
