import { TransactionOptions } from "@stacks/connect";
import { Schema, model } from "mongoose";

const schema = new Schema<TransactionOptions>({
  amount: { required: false, type: Number },
  recipient: { required: false, type: String },
});

export const SendSTX = model<TransactionOptions>("SendSTX", schema);
