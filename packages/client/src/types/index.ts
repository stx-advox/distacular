export interface IGetFundingProposalData {
  contractAddress: string;
  grants: [grantee: string, amount: number][];
  memo: string;
}
