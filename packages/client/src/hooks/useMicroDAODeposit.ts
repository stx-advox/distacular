import { tokenList } from "@distacular/common";
import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  contractPrincipalCV,
  FungibleConditionCode,
  makeContractFungiblePostCondition,
  makeContractSTXPostCondition,
  makeStandardFungiblePostCondition,
  makeStandardSTXPostCondition,
  uintCV,
} from "@stacks/transactions";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { userSession } from "../constants/stacks-session";

export const findTokenByContract = (tokenContract?: string) => {
  if (!tokenContract) {
    return tokenList[0];
  }
  return (
    tokenList.find((token) =>
      token.fullAddresses[0].startsWith(tokenContract)
    ) || tokenList[0]
  );
};

export const buildTokenPC = (
  account: string,
  tokenContract: string,
  amount: string
) => {
  const parts = account.split(".");
  const isContract = parts.length === 2;
  const details = findTokenByContract(tokenContract);
  if (tokenList[0].fullAddresses[0].startsWith(tokenContract)) {
    if (isContract) {
      return makeContractSTXPostCondition(
        parts[0],
        parts[1],
        FungibleConditionCode.Equal,
        amount
      );
    }
    return makeStandardSTXPostCondition(
      account,
      FungibleConditionCode.Equal,
      amount
    );
  }
  if (details) {
    if (isContract) {
      return makeContractFungiblePostCondition(
        parts[0],
        parts[1],
        FungibleConditionCode.Equal,
        amount,
        details.fullAddresses[0]
      );
    }
    return makeStandardFungiblePostCondition(
      account,
      FungibleConditionCode.Equal,
      amount,
      details.fullAddresses[0]
    );
  }
};

export const useMicroDAODeposit = () => {
  const { contractAddress, amount, tokenContractAddress } = useParams<{
    contractAddress: string;
    tokenContractAddress: string;
    amount: string;
  }>();

  const [txId, setTxId] = useState("");
  const deposit = useCallback(async () => {
    if (contractAddress && amount && tokenContractAddress) {
      const [address, name] = contractAddress.split(".");
      const userAddress = userSession.loadUserData().profile.stxAddress.mainnet;
      const postCondition = buildTokenPC(
        userAddress,
        tokenContractAddress,
        amount
      );
      if (!postCondition) {
        return alert(`Yo pick a whitelisted contract!`);
      }
      const token = tokenContractAddress.split("::")[0].split(".");
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: "deposit",
        functionArgs: [contractPrincipalCV(token[0], token[1]), uintCV(amount)],
        network: new StacksMainnet(),
        onFinish(data) {
          setTxId(data.txId);
        },
        postConditions: [postCondition],
      });
    }
  }, [contractAddress, amount, tokenContractAddress]);
  return {
    txId,
    deposit,
    contractAddress,
    tokenDetails: findTokenByContract(tokenContractAddress),
    amount,
  };
};
