import { Schema, model } from "mongoose";

export interface IDAOSubscription {
  daoContractAddress?: string;
  // discord channel or thread id
  channelId: string;
  // discord guild id
  guildId: string;
}

const schema = new Schema<IDAOSubscription>({
  daoContractAddress: { required: false, type: String },
  channelId: { required: true, type: String },
  guildId: { required: true, type: String },
});

export const DAOSubscription = model<IDAOSubscription>(
  "DAOSubscription",
  schema
);
