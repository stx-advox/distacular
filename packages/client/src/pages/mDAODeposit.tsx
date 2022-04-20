import { toFixed } from "@distacular/common";
import React, { useMemo } from "react";
import Button from "react-bootstrap/esm/Button";
import { useDeployerName } from "../hooks";
import { useMicroDAODeposit } from "../hooks";

const MicroDAODepositView: React.FC = () => {
  const { contractAddress, deposit, txId, amount, tokenDetails } =
    useMicroDAODeposit();
  const deployerName = useDeployerName(contractAddress);
  const tokenAmount = useMemo(
    () => toFixed(Number(amount) / Number(`1e${tokenDetails.scale}`)),
    [amount, tokenDetails.scale]
  );
  return contractAddress ? (
    <div className="App">
      <header className="App-header">
        <p>
          DAO name: {deployerName}.{contractAddress.split(".")[1]}
        </p>
        <p>
          Deposit Amount: {tokenAmount} {tokenDetails.name}
        </p>
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
