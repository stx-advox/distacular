import { Button } from "react-bootstrap";
import { useExecuteFundingProposal } from "../hooks";



const ExecuteFundingProposalView = () => {
  const { contractAddress, execute, txId } = useExecuteFundingProposal()

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
