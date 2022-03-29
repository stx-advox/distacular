import { Schema, model } from "mongoose";

export interface IMicroDAO {
  name: string;
  members: string[];
}

const schema = new Schema<IMicroDAO>({
  name: { required: true, type: String },
  members: { required: true, type: [String] },
});

export const MicroDAO = model<IMicroDAO>("MicroDAO", schema);
