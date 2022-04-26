import { Schema, model } from "mongoose";
import { tokenList } from "@distacular/common";

export interface IFundingProposal {
  daoContractAddress: string;
  grants: [grantee: string, amount: number][];
  memo: string;
  tokenContractAddress: string;
}

const schema = new Schema<IFundingProposal>({
  daoContractAddress: { required: false, type: String },
  grants: { required: true, type: [[String, Number]] },
  memo: { required: true, type: String },
  tokenContractAddress: {
    required: true,
    type: String,
    default: tokenList[0].fullAddresses[0],
    enum: tokenList.map((token) => token.fullAddresses[0]),
  },
});

export const FundingProposal = model<IFundingProposal>(
  "FundingProposal",
  schema
);
