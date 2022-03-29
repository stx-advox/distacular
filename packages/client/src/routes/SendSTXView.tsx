import { openSTXTransfer } from "@stacks/connect-react";
import React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { useParams } from "react-router-dom";

interface IGetSendSTXResponse {
    recipient: string;
    amount: number;
}

const SendSTXView: React.FC = () => {
    const { txId } = useParams<{ txId: string }>();

    const [txData, setTx] = useState<IGetSendSTXResponse>();

    useEffect(() => {
        if (txId) {
            fetch(`${process.env.REACT_APP_ENDPOINT}/api/send-stx/${txId}`)
                .then((data) => data.json())
                .then((data: IGetSendSTXResponse) => {
                    setTx(data);
                });
        }
    }, [txId]);

    const confirmSendSTX = useCallback(() => {
        if (txData) {
            openSTXTransfer({
                ...txData,
                amount: String(txData.amount),
            });
        }
    }, [txData]);

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
