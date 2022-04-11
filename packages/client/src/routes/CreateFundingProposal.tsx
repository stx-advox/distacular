import Button from "react-bootstrap/Button";
import { useCreateFundingProposalTx } from "../hooks";


export const CreateFundingProposalView = () => {
  // hooks
  const { fundingProposalData, grants, txId, submitCreateFundingProposalTx } = useCreateFundingProposalTx()

  return fundingProposalData ? (
    <div className="App">
      <header className="App-header">
        <p>DAO name: {fundingProposalData.contractAddress.split(".")[1]}</p>
        <p>Funding Proposal Description: {fundingProposalData.memo}</p>
        <p>Members:</p>
        <p style={{ fontSize: 24 }}>
          {grants}
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
