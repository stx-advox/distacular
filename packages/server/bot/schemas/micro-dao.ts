import { Schema, model } from "mongoose";

export interface IMicroDAO {
  name: string;
  members: string[];
  contractAddress?: string;
}

const schema = new Schema<IMicroDAO>({
  name: { required: true, type: String },
  members: { required: true, type: [String] },
  contractAddress: { type: String, required: false },
});

export const MicroDAO = model<IMicroDAO>("MicroDAO", schema);
