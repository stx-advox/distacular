import {
  CommandInteractionOption,
  CommandInteraction,
  MessageActionRow,
  GuildMember,
  MessageSelectMenu,
  MessageButton,
  SelectMenuInteraction,
} from "discord.js";
import { checkSTXAmount } from "../send-stx";
import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import { getDAOChoices } from "../../utils/commands/micro-dao/deposit-micro-dao";
import { client } from "../../client";

const SELECT_DAO_DEPOSIT_PREFIX = "select-deposit-dao-";

export const buildDAOSelect = async (
  action_id: string,
  address: string,
  prefix: string,
  selectedValue?: string,
  disabled = false
) => {
  const myDAOs = await getDAOChoices(address);

  return new MessageActionRow().addComponents([
    new MessageSelectMenu()
      .setCustomId(`${prefix}${action_id}`)
      .setPlaceholder(`Select DAO`)
      .setMaxValues(1)
      .setMinValues(1)
      .setOptions(
        myDAOs.map((dao) => ({
          label: dao[0],
          value: dao[1],
          description: dao[0],
          default: selectedValue === dao[1],
        }))
      )
      .setDisabled(disabled),
  ]);
};

export const markSelected = (
  interaction: SelectMenuInteraction,
  actionRow: MessageActionRow,
  disabled = false,
  defaultValue = ""
) => {
  actionRow.components = actionRow.components.map((component) => {
    if (component instanceof MessageSelectMenu) {
      component.setDisabled(disabled);
      component.options = component.options.map((option) => {
        option.default =
          option.value === (defaultValue || interaction.values[0]);
        return option;
      });
    }
    return component;
  });

  return actionRow;
};
export const getBNSFromInteraction = (
  interaction: CommandInteraction | SelectMenuInteraction
) => {
  const userName =
    (interaction.member as GuildMember).nickname || interaction.user.username;
  return getNameAddressWithErrorHandling(userName, interaction);
};
export const handleDepositMicroDAO = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const options = subcommand.options;

  if (!options) {
    return;
  }

  const amount = options.find((item) => item.name === "amount")
    ?.value as number;
  if (checkSTXAmount(amount, interaction)) {
    return null;
  }
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }

  interaction.editReply({
    content: `Select the DAO you would deposit to from your DAOs`,
    components: [
      await buildDAOSelect(
        `${amount}`,
        userAddress.address,
        SELECT_DAO_DEPOSIT_PREFIX
      ),
    ],
  });
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_DAO_DEPOSIT_PREFIX)
  ) {
    const amount = interaction.customId.replace(SELECT_DAO_DEPOSIT_PREFIX, "");

    const confirmButton = interaction.message
      ?.components?.[1] as MessageActionRow | null;

    const components = [
      markSelected(
        interaction,
        interaction.message.components?.[0] as MessageActionRow,
        true
      ),
    ];
    if (confirmButton) {
      confirmButton.components = confirmButton.components.map((component) =>
        component.setDisabled()
      );
      components.push(confirmButton);
    }

    await interaction.deferUpdate();
    await interaction.editReply({
      content: interaction.message.content,
      components,
    });

    const userAddress = await getBNSFromInteraction(interaction);

    if (!userAddress) {
      return;
    }

    if (amount) {
      const contractAddress = interaction.values[0];

      await interaction.editReply({
        content: `Confirm depositing to the selected DAO with the amount of ${amount} STX!`,
        components: [
          markSelected(
            interaction,
            interaction.message.components?.[0] as MessageActionRow
          ),
          new MessageActionRow().addComponents([
            new MessageButton({
              style: "LINK",
              url: `${
                process.env.SITE_URL
              }/deposit-micro-dao/${contractAddress}/${Number(amount) * 1e6}`,
              label: "Confirm Tx",
            }),
          ]),
        ],
      });
    }
  }
});
