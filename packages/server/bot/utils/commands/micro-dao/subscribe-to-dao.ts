import {
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
} from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";

export const buildSubscribe = new SlashCommandSubcommandBuilder()
  .setName("subscribe")
  .setDescription("Register to receive notifications about mDAO events")
  .addChannelOption(
    new SlashCommandChannelOption()
      .setName("channel")
      .setDescription("Channel to send notifications to")
      .setRequired(true)
      .addChannelTypes([
        ChannelType.GuildPublicThread,
        ChannelType.GuildPrivateThread,
        ChannelType.GuildText,
      ])
  );
