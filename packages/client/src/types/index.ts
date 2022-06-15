export interface IGetFundingProposalData {
  contractAddress: string;
  grants: [grantee: string, amount: number][];
  tokenContractAddress: string;
  memo: string;
}

export interface IGetDAOData {
  name: string;
  members: string[];
  admin: string;
  dissentPeriod: number;
  contractAddress?: string;
  id: string;
}

export interface IGetSendSTXResponse {
  recipient: string;
  amount: number;
}
