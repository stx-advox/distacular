import { openContractDeploy } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { mDAOContract } from "../constants/micro-dao";
import { userSession } from "../constants/stacks-session";
import { IGetDAOData } from "../types";
export const useCreateMiroDAO = () => {
  const { daoId } = useParams<{ daoId: string }>();
  const [txId, setTxId] = useState("");

  const { data: daoData, status } = useQuery<IGetDAOData, Error>(
    ["micro-dao", daoId],
    () =>
      fetch(`${process.env.REACT_APP_ENDPOINT}/api/micro-dao/${daoId}`).then(
        (data) => data.json()
      ),
    {
      enabled: !!daoId,
      staleTime: 0,
      cacheTime: 0,
      retry: 0,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  );

  const { mutate } = useMutation(
    async (txId: string) =>
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
      ),
    {
      retry: 1,
    }
  );

  const registerMicroDAOContract = useCallback(
    (txId: string) => {
      mutate(txId);
    },
    [mutate]
  );

  const deployDAOContract = useCallback(() => {
    if (daoData) {
      const myAddress = userSession.loadUserData().profile.stxAddress.mainnet;
      const daoMembersList = daoData.members
        // since tx-sender is by default a member of the DAO repitition is unnecessary
        .filter((memberAddress: any) => memberAddress !== myAddress)
        .map((memberAddress: any) => `{address: '${memberAddress}}`)
        .join("\n        ");
      const updatedContract = mDAOContract
        .replace("$INITIAL_MEMBERS_PLACEHOLDER", daoMembersList)
        // Default is 5 bitcoin days
        .replace("$DISSENT_EXPIRY", String(daoData.dissentPeriod || 144 * 5));
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
  return {
    deployDAOContract,
    daoData,
    status,
    txId,
  };
};
