import { ButtonComponent } from "@discordjs/builders";
import {
  CommandInteractionOption,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";

export const handleUpgradeDAO = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  interaction.editReply({
    content: "Click on the button below to upgrade your DAO",
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle("LINK")
          .setLabel("Upgrade DAO")
          .setURL(`${process.env.SITE_URL}/upgrade`)
          .setEmoji("🔨"),
      ]),
    ],
  });
};
