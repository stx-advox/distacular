import {
  Configuration,
  InfoApi,
  SmartContractsApi,
} from "@stacks/blockchain-api-client";
import { cvToHex, cvToJSON, hexToCV, uintCV } from "@stacks/transactions";

export interface IFormattedProposal {
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

export interface ITarget {
  address: string;
  amount: number;
}

export interface IClarityValue {
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

  const result = cvToJSON(hexToCV(res.result as string))
    .value as IClarityValue | null;

  if (result) {
    const formattedProposal = unpackCV(result) as IFormattedProposal;
    formattedProposal.id = proposalIndex;
    formattedProposal.isPastDissent =
      formattedProposal["created-at"] + 144 * 5 < burn_block_height;

    return formattedProposal;
  }
};
