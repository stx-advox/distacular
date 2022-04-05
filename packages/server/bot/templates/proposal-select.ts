import {
  Configuration,
  InfoApi,
  SmartContractsApi,
} from "@stacks/blockchain-api-client";
import { cvToHex, cvToJSON, hexToCV, uintCV } from "@stacks/transactions";
import { MessageActionRow, MessageSelectMenu } from "discord.js";

interface IFormattedProposal {
  id: number;
  /** the bitcoin block height when this proposal was created*/
  "created-at": number;
  memo: string;
  proposer: string;
  status: number;
  targets: ITarget[];
  "total-amount": number;
  isPastDissent: boolean;
}

interface ITarget {
  address: string;
  amount: number;
}

interface IClarityValue {
  type: string;
  value: any;
}

export const unpackCV = (proposal: IClarityValue) => {
  switch (proposal.type) {
    case "uint":
    case "int":
      return Number(proposal.value);
  }
  if (typeof proposal.value === "string") {
    return proposal.value;
  }

  if (proposal.value instanceof Array) {
    return proposal.value.map((item) => unpackCV(item));
  }

  return Object.keys(proposal.value).reduce((acc, key) => {
    return {
      ...acc,
      [key]: unpackCV(proposal.value[key]),
    };
  }, {} as any);
};

const config = new Configuration({
  basePath: process.env.STACKS_URL,
});

export const SCApi = new SmartContractsApi(config);

export const infoApi = new InfoApi(config);

export const getProposal = async (
  contractId: string,
  proposalIndex: number,
  burn_block_height?: number
) => {
  if (!burn_block_height) {
    burn_block_height = (await infoApi.getCoreApiInfo()).burn_block_height;
  }

  const [contractAddress, contractName] = contractId.split(".");
  const res = await SCApi.callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-proposal-raw",
    readOnlyFunctionArgs: {
      sender: contractAddress,
      arguments: [cvToHex(uintCV(proposalIndex))],
    },
  });

  const result = cvToJSON(hexToCV(res.result!)).value as IClarityValue | null;

  if (result) {
    const formattedProposal = unpackCV(result) as IFormattedProposal;
    formattedProposal.id = proposalIndex;
    formattedProposal.isPastDissent =
      formattedProposal["created-at"] + 144 * 5 < burn_block_height;

    return formattedProposal;
  }
};

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
        memo: "",
        proposer: "",
        status: 0,
        targets: [],
      },
    ];
    isDisabled = true;
  }

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
            p["total-amount"] / 1e6
          }`,
          value: p.id.toString(),

          default: p.id.toString() === preSetValue,
        }))
      )
      .setDisabled(isDisabled),
  ]);
};
