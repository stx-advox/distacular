import { Schema, model } from "mongoose";

export interface IFundingProposal {
  daoContractAddress: string;
  grants: [grantee: string, amount: number][];
  memo: string;
}

const schema = new Schema<IFundingProposal>({
  daoContractAddress: { required: false, type: String },
  grants: { required: true, type: [[String, Number]] },
  memo: { required: true, type: String },
});

export const FundingProposal = model<IFundingProposal>(
  "FundingProposal",
  schema
);
