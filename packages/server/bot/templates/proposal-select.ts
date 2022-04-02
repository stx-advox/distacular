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

export const getDAOPendingProposals = async (contractId: string) => {
  const config = new Configuration({
    basePath: process.env.STACKS_URL,
  });
  const SCApi = new SmartContractsApi(config);

  let proposalIndex = 0;
  let doneGettingProposals = false;

  const proposals: IFormattedProposal[] = [];

  const [contractAddress, contractName] = contractId.split(".");
  const infoApi = new InfoApi(config);

  const { burn_block_height } = await infoApi.getCoreApiInfo();

  while (!doneGettingProposals) {
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
      if (formattedProposal.status === 0) {
        proposals.push(formattedProposal);
      }
    }

    doneGettingProposals = !result;

    proposalIndex++;
  }
  return proposals;
};

export const proposalSelect = async (
  contractId: string,
  includePastDissent = true,
  custom_id = "",
  preSetValue = ""
) => {
  let proposals: IFormattedProposal[] = [];
  let placeholder = "Select proposal";
  try {
    proposals = await getDAOPendingProposals(contractId);
  } catch (e) {
    console.log(e);
    placeholder = "Some error happened please try again!";
  }

  const actionRow = new MessageActionRow();

  let isDisabled = false;

  if (proposals.length === 0) {
    placeholder = "This DAO has no pending proposals";
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
        proposals
          .filter((p) => includePastDissent || !p.isPastDissent)
          .map((p) => ({
            label: `Proposal #${p.id}`,
            description: p.memo,
            value: p.id.toString(),

            default: p.id.toString() === preSetValue,
          }))
      )
      .setDisabled(isDisabled),
  ]);
};
