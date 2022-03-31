import { Schema, model } from "mongoose";

export interface IFundingProposal {
  daoContractAddress: string;
  grants: [grantee: string, amount: number][];
}

const schema = new Schema<IFundingProposal>({
  daoContractAddress: { required: true, type: String },
  grants: { required: true, type: [[String, Number]] },
});

export const FundingProposal = model<IFundingProposal>(
  "FundingProposal",
  schema
);
