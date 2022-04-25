import {
  SmartContract,
  SmartContractsApi,
} from "@stacks/blockchain-api-client";
import { useConnect } from "@stacks/connect-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { mDAOContract } from "../constants/micro-dao";
import { apiConfig, userSession } from "../constants/stacks-session";
import { IGetDAOData } from "../types";
import { toast } from "react-toastify";
import { StacksMainnet } from "@stacks/network";
import {
  contractPrincipalCV,
  cvToString,
  hexToCV,
  listCV,
  stringUtf8CV,
  tupleCV,
} from "@stacks/transactions";

const scAPI = new SmartContractsApi(apiConfig);

export const UpgradeDAO: React.FC = () => {
  const { profile } = useMemo(() => userSession.loadUserData(), []);
  const stxAddress = profile.stxAddress.mainnet;
  const { doContractDeploy, doContractCall } = useConnect();

  const updateDAOContractAddress = useCallback(
    (daoId: string, contractAddress: string, proofTxId: string) => {
      return fetch(
        `${process.env.REACT_APP_ENDPOINT}/api/upgrade-dao-contract-address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            daoId,
            contractAddress,
            proofTxId,
          }),
        }
      );
    },
    []
  );

  const transferAllAssetsToNewDAO = useCallback(
    async (
      oldDAOAddress: string,
      newDAOAddress: string,
      dissentPeriod: number
    ) => {
      const remainingSTXBalance = await scAPI.callReadOnlyFunction({
        contractAddress: oldDAOAddress.split(".")[0],
        contractName: oldDAOAddress.split(".")[1],
        functionName: "get-balance",
        readOnlyFunctionArgs: {
          arguments: [],
          sender: oldDAOAddress.split(".")[0],
        },
      });

      const value = hexToCV(remainingSTXBalance.result as string);

      const formatted = cvToString(value);

      const match = formatted.match(/^\(ok u(?<balance>\d+)\)$/);

      const balance = match?.groups?.balance;

      if (balance && Number(balance)) {
        doContractCall({
          contractAddress: oldDAOAddress.split(".")[0],
          contractName: oldDAOAddress.split(".")[1],
          functionName: "create-funding-proposal",
          functionArgs: [
            listCV([
              tupleCV({
                address: contractPrincipalCV(
                  newDAOAddress.split(".")[0],
                  newDAOAddress.split(".")[1]
                ),
              }),
            ]),
            stringUtf8CV(`Transfer ${balance} STX to new DAO`),
          ],
          onFinish() {
            toast.success(
              `Wait ${dissentPeriod} blocks to send the old DAO's funds to the new DAO, using the execute function`
            );
          },
          onCancel() {
            toast.error("DAO funds transfer cancelled");
          },
        });
      }
    },
    []
  );

  const upgradeDAOs = useCallback(async () => {
    const { profile } = userSession.loadUserData();

    const stxAddress = profile.stxAddress.mainnet;
    // let abi = "";

    // const referenceContract =
    //   "SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.gov-lab";

    // {
    //   const res = (await scAPI.getContractById({
    //     contractId: referenceContract,
    //   })) as SmartContract;

    //   abi = res.abi;
    //   console.log(res);
    // }

    const res = await fetch(
      `${process.env.REACT_APP_ENDPOINT}/api/get-daos-by-deployer-address/${stxAddress}`
    );

    const DAOs = (await res.json()) as IGetDAOData[];

    for (const dao of DAOs) {
      if (!dao.contractAddress) {
        continue;
      }
      const res = (await scAPI.getContractById({
        contractId: dao.contractAddress,
      })) as SmartContract;

      if (!res) {
        return toast.error(
          "weird lol, that shouldn't happen, go fuck up hz, a dao contract was not found wat?"
        );
      }

      if (
        res.source_code.includes(
          "'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.wstx"
        )
      ) {
        return toast.info(
          `${dao.contractAddress.split(".")[1]} is already upgraded`
        );
      }

      const { dissentPeriod, members, name } = dao;
      const newName = `${name}-sip-010`;
      const daoMembersList = members
        // since tx-sender is by default a member of the DAO repitition is unnecessary
        .filter((memberAddress: any) => memberAddress !== stxAddress)
        .map((memberAddress: any) => `{address: '${memberAddress}}`)
        .join("\n        ");

      const newContract = mDAOContract
        .replace("$DISSENT_EXPIRY", String(dissentPeriod || 144 * 5))
        .replace("$INITIAL_MEMBERS_PLACEHOLDER", daoMembersList);

      const newContractAddress = `${stxAddress}.${newName}`;

      doContractDeploy({
        codeBody: newContract,
        contractName: newName,
        network: new StacksMainnet(),
        async onFinish(data) {
          await updateDAOContractAddress(dao.id, newContractAddress, data.txId)
            .then(() => {
              toast.success("DAO contract upgraded!!");
            })
            .catch((err) => {
              toast.error(err);
            });
          await transferAllAssetsToNewDAO(
            dao.contractAddress as string,
            newContractAddress,
            dissentPeriod || 144 * 5
          );

          toast.success(
            `${
              dao.contractAddress!.split(".")[1]
            } upgraded to ${newName}, wait for the tx to be mined`
          );
        },
        onCancel() {
          toast.error("DAO contract upgrade cancelled");
        },
      });
    }
  }, []);

  useEffect((): void => {
    upgradeDAOs();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>UpgradeDAO</h1>
        <p>
          This page will allow you to upgrade any DAO you have previously
          deployed to the latest version of the smart contract. your address is{" "}
          {stxAddress}
        </p>
        <p>
          Please wait while we load the data and start the process... This may
          take a few minutes.
        </p>
      </header>
    </div>
  );
};
