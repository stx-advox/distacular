import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  contractPrincipalCV,
  FungiblePostCondition,
  uintCV,
} from "@stacks/transactions";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { buildTokenPC } from "./useMicroDAODeposit";
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
      const token = proposal["token-contract"].split(".") as [string, string];
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: "execute-funding-proposal",
        functionArgs: [uintCV(proposalId), contractPrincipalCV(...token)],
        network: new StacksMainnet(),
        postConditions: [
          buildTokenPC(
            contractAddress,
            proposal["token-contract"],
            String(proposal["total-amount"])
          ) as FungiblePostCondition,
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
