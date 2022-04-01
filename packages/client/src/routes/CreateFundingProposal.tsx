import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { openContractCall } from "@stacks/connect-react";
import { listCV, stringUtf8CV, tupleCV, uintCV } from "@stacks/transactions";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";

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

  const submitCreateFundingProposalTx = useCallback(() => {
    if (fundingProposalData) {
      const [contractAddress, contractName] =
        fundingProposalData.contractAddress.split(".");
      openContractCall({
        contractAddress,
        contractName,
        functionName: "create-funding-proposal",
        functionArgs: [
          listCV(
            fundingProposalData.grants.map(([grantee, amount]) =>
              tupleCV({ grantee: principalCV(grantee), amount: uintCV(amount) })
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
        <p>
          Members:{" "}
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
            Check the dao here!
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
