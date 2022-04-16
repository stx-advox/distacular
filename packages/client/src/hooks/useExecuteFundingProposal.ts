import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  FungibleConditionCode,
  makeContractSTXPostCondition,
  uintCV,
} from "@stacks/transactions";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useProposal } from "./useProposal";

export const useExecuteFundingProposal = () => {
  const { contractAddress, proposalId } = useParams<{
    contractAddress: string;
    proposalId: string;
  }>();

  const [txId, setTxId] = useState("");

  const proposal = useProposal(contractAddress as string, proposalId as string);

  const execute = useCallback(async () => {
    if (contractAddress && proposalId && proposal) {
      const [address, name] = contractAddress.split(".");
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: "execute-funding-proposal",
        functionArgs: [uintCV(proposalId)],
        network: new StacksMainnet(),
        postConditions: [
          makeContractSTXPostCondition(
            address,
            name,
            FungibleConditionCode.Equal,
            proposal["total-amount"]
          ),
        ],
        onFinish(data) {
          setTxId(data.txId);
        },
      });
    }
  }, [contractAddress, proposal, proposalId]);
  return {
    txId,
    execute,
    contractAddress,
  };
};
