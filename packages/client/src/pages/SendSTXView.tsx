import React from "react";
import Button from "react-bootstrap/esm/Button";
import { useSendSTX } from "../hooks";


const SendSTXView: React.FC = () => {
    const { txData, confirmSendSTX } = useSendSTX()
    return txData ? (
        <div className="App">
            <header className="App-header">
                <p>Recipient: {txData.recipient}</p>
                <p>Amount: {txData.amount / 1e6} STX</p>

                <Button onClick={confirmSendSTX} size="lg" variant="primary">
                    Confirm TX
                </Button>
            </header>
        </div>
    ) : (
        <p>please provide a tx id</p>
    );
};

export default SendSTXView;
