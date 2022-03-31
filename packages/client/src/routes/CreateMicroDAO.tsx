import { openContractDeploy } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { useParams } from "react-router-dom";
import { mDAOContract } from "../constants/micro-dao";
import { userSession } from "../constants/stacks-session";

interface IGetDAOData {
  name: string;
  members: string[];
}

const CreateMicroDAOView: React.FC = () => {
  const { daoId } = useParams<{ daoId: string }>();

  const [daoData, setDAOData] = useState<IGetDAOData>();
  const [txId, setTxId] = useState("");
  useEffect(() => {
    if (daoId) {
      fetch(`${process.env.REACT_APP_ENDPOINT}/api/micro-dao/${daoId}`)
        .then((data) => data.json())
        .then((data: IGetDAOData) => {
          setDAOData(data);
        });
    }
  }, [daoId]);

  const registerMicroDAOContract = useCallback(
    async (txId: string) => {
      await fetch(
        `${process.env.REACT_APP_ENDPOINT}/api/micro-dao/${daoId}/contract-address`,
        {
          method: "PUT",
          body: JSON.stringify({
            txId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    },

    [daoId]
  );

  const deployDAOContract = useCallback(() => {
    if (daoData) {
      const myAddress = userSession.loadUserData().profile.stxAddress.mainnet;
      const daoMembersList = daoData.members
        // since tx-sender is by default a member of the DAO repitition is unnecessary
        .filter((memberAddress) => memberAddress !== myAddress)
        .map((memberAddress) => `{address: '${memberAddress}}`)
        .join("\n        ");
      const updatedContract = mDAOContract.replace(
        "$INITIAL_MEMBERS_PLACEHOLDER",
        daoMembersList
      );
      openContractDeploy({
        codeBody: updatedContract,
        contractName: daoData.name,
        network: new StacksMainnet(),
        onFinish(data) {
          setTxId(data.txId);
          registerMicroDAOContract(data.txId);
        },
      });
    }
  }, [daoData, registerMicroDAOContract]);

  return daoData ? (
    <div className="App">
      <header className="App-header">
        <p>DAO name: {daoData.name}</p>
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
