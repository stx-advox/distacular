import { openContractCall } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import { uintCV } from "@stacks/transactions";
import { useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import { useParams } from "react-router-dom";

const ExecuteFundingProposalView = () => {
  const { contractAddress, proposalId } = useParams<{
    contractAddress: string;
    proposalId: string;
  }>();

  const [txId, setTxId] = useState("");

  const execute = useCallback(async () => {
    if (contractAddress && proposalId) {
      const [address, name] = contractAddress.split(".");
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName: "execute-funding-proposal",
        functionArgs: [uintCV(proposalId)],
        network: new StacksMainnet(),
        onFinish(data) {
          setTxId(data.txId);
        },
      });
    }
  }, [contractAddress, proposalId]);

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
