import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import {
  FungibleConditionCode,
  makeContractSTXPostCondition,
  uintCV,
} from "@stacks/transactions";
import { useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useProposal } from "../hooks";



const ExecuteFundingProposalView = () => {
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

  return contractAddress ? (
    <div className="App">
      <header className="App-header">
        {txId ? (
          <Button
            href={`https://explorer.stacks.co/txid/${txId}?chain=mainnet`}
            variant={"link"}
            size="lg"
          >
            Check the tx here!
          </Button>
        ) : (
          <Button onClick={execute} size="lg" variant="primary">
            Execute Funding Proposal
          </Button>
        )}
      </header>
    </div>
  ) : (
    <p>please provide a valid contract address id</p>
  );
};

export default ExecuteFundingProposalView;
