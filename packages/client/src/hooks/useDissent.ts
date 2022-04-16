import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import { uintCV } from "@stacks/transactions";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

export const useDissent = () => {
  const { contractAddress, proposalId } = useParams<{
    contractAddress: string;
    proposalId: string;
  }>();

  const [txId, setTxId] = useState("");

  const dissent = useCallback(async () => {
    if (contractAddress && proposalId) {
      const [address, name] = contractAddress.split(".");
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: "dissent",
        functionArgs: [uintCV(proposalId)],
        network: new StacksMainnet(),
        onFinish(data) {
          setTxId(data.txId);
        },
      });
    }
  }, [contractAddress, proposalId]);
  return {
    contractAddress,
    dissent,
    txId,
  };
};
