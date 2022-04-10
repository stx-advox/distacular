import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  listCV,
  tupleCV,
  uintCV,
  stringUtf8CV,
  callReadOnlyFunction,
  cvToJSON,
} from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { userSession } from "../constants/stacks-session";
import { Queries } from "../queries";

export const useCreateFundingProposalTx = () => {
  // hooks
  const { id } = useParams<{ id: string }>();
  const { profile } = userSession.loadUserData();

  // react query
  const { data: fundingProposalData, status } = Queries.getFundingProposal(id);
  // state
  const [txId, setTxId] = useState("");

  const submitCreateFundingProposalTx = useCallback(async () => {
    if (fundingProposalData && status === "success") {
      const [contractAddress, contractName] =
        fundingProposalData.contractAddress.split(".");
      const balanceRes = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-balance",
        functionArgs: [],
        senderAddress: profile.stxAddress.mainnet,
      });

      const contractBalance = Number(cvToJSON(balanceRes).value.value);

      const totalAmount = fundingProposalData.grants.reduce(
        (acc, [, amount]) => acc + Number(amount),
        0
      );

      if (totalAmount > contractBalance) {
        if (
          !window.confirm(
            "The mDAO balance will not suffice and the transaction will probably fail are you sure you want to submit the transaction?"
          )
        ) {
          return;
        }
      }

      openContractCall({
        contractAddress,
        contractName,
        functionName: "create-funding-proposal",
        network: new StacksMainnet(),
        functionArgs: [
          listCV(
            fundingProposalData.grants.map(([grantee, amount]) =>
              tupleCV({ address: principalCV(grantee), amount: uintCV(amount) })
            )
          ),
          stringUtf8CV(fundingProposalData.memo),
        ],
        onFinish(data) {
          setTxId(data.txId);
        },
      });
    }
  }, [fundingProposalData, status]);

  const grants = useMemo(() => {
    return fundingProposalData?.grants
      .map((item) => `Address: ${item[0]}, Amount: ${item[1] / 1e6} STX`)
      .join("\n");
  }, [fundingProposalData?.grants]);

  return {
    submitCreateFundingProposalTx,
    txId,
    grants,
    fundingProposalData,
  };
};
