import React from "react";
import Button from "react-bootstrap/Button";
import { useBNSName, useCreateFundingProposalTx } from "../hooks";

const Fuck: React.FC<{ grantee: string; amount: string }> = ({
  grantee,
  amount,
}) => {
  const bnsName = useBNSName(grantee);
  return (
    <p>
      User: {bnsName} Amount {amount}
    </p>
  );
};

const CreateFundingProposalView: React.FC = () => {
  // hooks
  const { fundingProposalData, grants, txId, submitCreateFundingProposalTx } =
    useCreateFundingProposalTx();

  return fundingProposalData ? (
    <div className="App">
      <header className="App-header">
        <p>DAO name: {fundingProposalData.contractAddress.split(".")[1]}</p>
        <p>Funding Proposal Description: {fundingProposalData.memo}</p>
        <p>Members:</p>
        {grants.map((grant) => (
          <Fuck
            key={grant.grantee}
            grantee={grant.grantee}
            amount={grant.amount}
          />
        ))}
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

export default CreateFundingProposalView;
