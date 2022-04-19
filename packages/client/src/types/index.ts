export interface IGetFundingProposalData {
  contractAddress: string;
  grants: [grantee: string, amount: number][];
  memo: string;
}

export interface IGetDAOData {
  name: string;
  members: string[];
  dissentPeriod: number;
}

export interface IGetSendSTXResponse {
  recipient: string;
  amount: number;
}
