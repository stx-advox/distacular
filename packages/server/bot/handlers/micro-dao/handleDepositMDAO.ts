import {
  CommandInteractionOption,
  CommandInteraction,
  MessageActionRow,
  GuildMember,
  MessageSelectMenu,
  Interaction,
  MessageButton,
} from "discord.js";
import { checkSTXAmount } from "../send-stx";
import { getNameAddressWithErrorHandling } from "../../utils/getNameAddress";
import { getDAOChoices } from "../../utils/commands/micro-dao/deposit-micro-dao";
import { Schema, model } from "mongoose";
import { client } from "../../client";
interface IDepositAction {
  amount: number;
  contractAddress?: string;
}

const SELECT_DAO_DEPOSIT_PREFIX = "select-deposit-dao-";
const CONFIRM_DEPOSIT_PREFIX = "confirm-deposit-";

const schema = new Schema<IDepositAction>({
  amount: { required: true, type: Number },
  contractAddress: { required: false, type: String },
});

const buildDAOSelect = async (
  action_id: string,
  address: string,
  selectedValue?: string,
  disabled = false
) => {
  const myDAOs = await getDAOChoices(address);

  return new MessageActionRow().addComponents([
    new MessageSelectMenu()
      .setCustomId(`${SELECT_DAO_DEPOSIT_PREFIX}${action_id!}`)
      .setPlaceholder(`Select DAO to deposit`)
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

const DepositAction = model<IDepositAction>("DepositAction", schema);

export const getBNSFromInteraction = (interaction: Interaction) => {
  const userName =
    (interaction.member as GuildMember).nickname || interaction.user.username;
  return getNameAddressWithErrorHandling(userName, interaction as any);
};
export const handleDepositMicroDAO = async (
  subcommand: CommandInteractionOption,
  interaction: CommandInteraction
) => {
  const options = subcommand.options!;

  const amount = options.find((item) => item.name === "amount")!
    .value as number;
  if (checkSTXAmount(amount, interaction)) {
    return null;
  }
  const userAddress = await getBNSFromInteraction(interaction);

  if (!userAddress) {
    return;
  }

  const action = new DepositAction();

  action.amount = amount;

  await action.save();

  interaction.editReply({
    content: `Select the DAO you would deposit to from your DAOs`,
    components: [await buildDAOSelect(action.id!, userAddress.address!)],
  });
};

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isSelectMenu() &&
    interaction.customId.startsWith(SELECT_DAO_DEPOSIT_PREFIX)
  ) {
    const actionId = interaction.customId.replace(
      SELECT_DAO_DEPOSIT_PREFIX,
      ""
    );
    const confirmButton = interaction.message
      .components![1] as MessageActionRow | null;

    const getCachedDAOsCmp = (disabled = false) => {
      const daoSelect = interaction.message.components![0] as MessageActionRow;
      daoSelect.components = daoSelect.components.map((component) => {
        if (component instanceof MessageSelectMenu) {
          component.setDisabled(disabled);
          component.options = component.options.map((option) => {
            option.default = option.value === interaction.values[0];
            return option;
          });
        }
        return component;
      });

      return daoSelect;
    };

    const components = [getCachedDAOsCmp(true)];
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

    const action = await DepositAction.findById(actionId).exec();

    const userAddress = await getBNSFromInteraction(interaction);

    if (!userAddress) {
      return;
    }

    if (action) {
      action.contractAddress = interaction.values[0];
      await action.save();

      await interaction.editReply({
        content: `Confirm depositing to the selected DAO with the amount of ${action.amount} STX!`,
        components: [
          getCachedDAOsCmp(),
          new MessageActionRow().addComponents([
            new MessageButton({
              style: "LINK",
              url: `${process.env.SITE_URL}/deposit-micro-dao/${
                action.contractAddress
              }/${action.amount * 1e6}`,
              label: "Confirm Tx",
            }),
          ]),
        ],
      });
    }
  }
});
