import React from "react";
import Button from "react-bootstrap/esm/Button";
import { useDeployerName } from "../hooks";
import { useMicroDAODeposit } from "../hooks";


const MicroDAODepositView: React.FC = () => {
  const { contractAddress, deposit, txId, amount } = useMicroDAODeposit()
  const deployerName = useDeployerName(contractAddress);

  return contractAddress ? (
    <div className="App">
      <header className="App-header">
        <p>
          DAO name: {deployerName}.{contractAddress.split(".")[1]}
        </p>
        <p>Deposit Amount: {Number(amount) / 1e6} STX</p>
        {txId ? (
          <Button
            href={`https://explorer.stacks.co/txid/${txId}?chain=mainnet`}
            variant={"link"}
            size="lg"
          >
            Check the deposit tx here!
          </Button>
        ) : (
          <Button onClick={deposit} size="lg" variant="primary">
            Deposit
          </Button>
        )}
      </header>
    </div>
  ) : (
    <p>please provide a valid contract address id</p>
  );
};

export default MicroDAODepositView;
