import { TransactionOptions } from "@stacks/connect";
import { Schema } from "mongoose";

const schema = new Schema<TransactionOptions>({
  contractAddress: { type: String, required: true },
  contractName: { type: String, required: true },
  functionName: { type: String, required: true },
  functionArgs: { required: true, type: [String] },
  postConditions: { required: false, type: [String] },
});
