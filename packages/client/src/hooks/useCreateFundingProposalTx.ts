import { toFixed } from "@distacular/common";
import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  listCV,
  tupleCV,
  uintCV,
  stringUtf8CV,
  callReadOnlyFunction,
  cvToJSON,
  contractPrincipalCV,
} from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { userSession } from "../constants/stacks-session";
import { IGetFundingProposalData } from "../types";
import { findTokenByContract } from "./useMicroDAODeposit";

export const useCreateFundingProposalTx = () => {
  // hooks
  const { id } = useParams<{ id: string }>();
  // react query
  const { data: fundingProposalData, status } = useQuery<
    IGetFundingProposalData,
    Error
  >(
    ["funding-proposal", id],
    () =>
      fetch(
        `${process.env.REACT_APP_ENDPOINT}/api/funding-proposal/${id}`
      ).then((data) => data.json()),
    {
      enabled: !!id,
      staleTime: 0,
      cacheTime: 0,
      retry: 0,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  );
  // state
  const [txId, setTxId] = useState("");

  const submitCreateFundingProposalTx = useCallback(async () => {
    if (fundingProposalData && status === "success") {
      const tokenContract = fundingProposalData.tokenContractAddress
        .split("::")[0]
        .split(".");
      const daoContract = fundingProposalData.contractAddress.split(".");
      const balanceRes = await callReadOnlyFunction({
        contractAddress: tokenContract[0],
        contractName: tokenContract[1],
        functionName: "get-balance",
        functionArgs: [contractPrincipalCV(daoContract[0], daoContract[1])],
        senderAddress: userSession.loadUserData().profile.stxAddress.mainnet,
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
        contractAddress: daoContract[0],
        contractName: daoContract[1],
        functionName: "create-funding-proposal",
        network: new StacksMainnet(),
        functionArgs: [
          listCV(
            fundingProposalData.grants.map(([grantee, amount]) =>
              tupleCV({ address: principalCV(grantee), amount: uintCV(amount) })
            )
          ),
          stringUtf8CV(fundingProposalData.memo),
          contractPrincipalCV(tokenContract[0], tokenContract[1]),
        ],
        onFinish(data) {
          setTxId(data.txId);
        },
      });
    }
  }, [fundingProposalData, status]);

  const grants = useMemo(() => {
    if (fundingProposalData) {
      const tokenInfo = findTokenByContract(
        fundingProposalData!.tokenContractAddress
      );
      return fundingProposalData!.grants.map((item) => {
        const tokenPrecision = toFixed(
          item[1] / Number(`1e${tokenInfo.scale}`)
        );
        return {
          grantee: item[0],
          amount: `${tokenPrecision} ${tokenInfo.name}`,
        };
      });
    }
    return [];
  }, [fundingProposalData]);

  return {
    submitCreateFundingProposalTx,
    txId,
    grants,
    fundingProposalData,
    status,
  };
};
