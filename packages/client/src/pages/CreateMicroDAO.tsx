import React from "react";
import Button from "react-bootstrap/Button";
import { useCreateMiroDAO } from "../hooks";

const CreateMicroDAOView: React.FC = () => {
  const { daoData, deployDAOContract, txId } = useCreateMiroDAO();

  return daoData ? (
    <div className="App">
      <header className="App-header">
        <p>DAO name: {daoData.name}</p>
        <p>Admin: {daoData.admin}</p>
        <p>Members: {daoData.members.join("\n")}</p>
        {txId ? (
          <Button
            href={`https://explorer.stacks.co/txid/${txId}?chain=mainnet`}
            variant={"link"}
            size="lg"
          >
            Check the dao here!
          </Button>
        ) : (
          <Button onClick={deployDAOContract} size="lg" variant="primary">
            Create DAO
          </Button>
        )}
      </header>
    </div>
  ) : (
    <p>please provide a tx id</p>
  );
};

export default CreateMicroDAOView;
