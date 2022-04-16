import { Button } from "react-bootstrap";
import { useDissent } from "../hooks";

const DissentView = () => {
  const { contractAddress, txId, dissent } = useDissent()

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
          <Button onClick={dissent} size="lg" variant="primary">
            Dissent
          </Button>
        )}
      </header>
    </div>
  ) : (
    <p>please provide a valid contract address id</p>
  );
};

export default DissentView;
