import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  createSTXPostCondition,
  FungibleConditionCode,
  uintCV,
} from "@stacks/transactions";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { userSession } from "../constants/stacks-session";

export const useMicroDAODeposit = () => {
  const { contractAddress, amount } = useParams<{
    contractAddress: string;
    amount: string;
  }>();

  const [txId, setTxId] = useState("");
  const deposit = useCallback(async () => {
    if (contractAddress && amount) {
      const [address, name] = contractAddress.split(".");
      const userAddress = userSession.loadUserData().profile.stxAddress.mainnet;
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: "deposit",
        functionArgs: [uintCV(amount)],
        network: new StacksMainnet(),
        onFinish(data) {
          setTxId(data.txId);
        },
        postConditions: [
          createSTXPostCondition(
            userAddress,
            FungibleConditionCode.Equal,
            amount
          ),
        ],
      });
    }
  }, [contractAddress, amount]);
  return {
    txId,
    deposit,
    contractAddress,
    amount,
  };
};