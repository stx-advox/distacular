import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { openContractCall } from "@stacks/connect-react";
import {
  callReadOnlyFunction,
  cvToJSON,
  listCV,
  stringUtf8CV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { userSession } from "../constants/stacks-session";
import { StacksMainnet } from "@stacks/network";

interface IGetFundingProposalData {
  contractAddress: string;
  grants: [grantee: string, amount: number][];
  memo: string;
}

export const CreateFundingProposalView = () => {
  const { id } = useParams<{ id: string }>();

  const [fundingProposalData, setFundingProposalData] =
    useState<IGetFundingProposalData>();
  const [txId, setTxId] = useState("");
  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_ENDPOINT}/api/funding-proposal/${id}`)
        .then((data) => data.json())
        .then((data: IGetFundingProposalData) => {
          setFundingProposalData(data);
        });
    }
  }, [id]);

  const submitCreateFundingProposalTx = useCallback(async () => {
    if (fundingProposalData) {
      const [contractAddress, contractName] =
        fundingProposalData.contractAddress.split(".");
      const balanceRes = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-balance",
        functionArgs: [],
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
  }, [fundingProposalData]);

  return fundingProposalData ? (
    <div className="App">
      <header className="App-header">
        <p>DAO name: {fundingProposalData.contractAddress.split(".")[1]}</p>
        <p>Funding Proposal Description: {fundingProposalData.memo}</p>
        <p>Members:</p>
        <p style={{ fontSize: 24 }}>
          {fundingProposalData.grants
            .map((item) => `Address: ${item[0]}, Amount: ${item[1] / 1e6} STX`)
            .join("\n")}
        </p>
        {txId ? (
          <Button
            href={`https://explorer.stacks.co/txid/${txId}?chain=mainnet`}
            variant={"link"}
            size="lg"
          >
            Check the funding proposal here
          </Button>
        ) : (
          <Button
            onClick={submitCreateFundingProposalTx}
            size="lg"
            variant="primary"
          >
            Create Funding Proposal
          </Button>
        )}
      </header>
    </div>
  ) : (
    <p>please provide a tx id</p>
  );
};
