import { Schema, model } from "mongoose";

export interface IMicroDAO {
  name: string;
  members: string[];
  dissentPeriod: number;
  contractAddress?: string;
  admin: string;
}

const schema = new Schema<IMicroDAO>({
  name: { required: true, type: String },
  members: { required: true, type: [String] },
  admin: { required: true, type: String },
  dissentPeriod: { required: true, type: Number },
  contractAddress: { type: String, required: false },
});

export const MicroDAO = model<IMicroDAO>("MicroDAO", schema);
