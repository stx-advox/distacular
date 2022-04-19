import { useCallback, useEffect, useState } from "react";
import { NamesApi } from "@stacks/blockchain-api-client";

export const useDeployerName = (contractAddress?: string) => {
  const [deployerName, setDeployerName] = useState<string>();

  const loadDeployerName = useCallback(async () => {
    if (contractAddress) {
      const [address] = contractAddress.split(".");
      const api = new NamesApi();
      const namesOwnedByDeployer = (
        await api.getNamesOwnedByAddress({
          address,
          blockchain: "stacks",
        })
      ).names;
      if (namesOwnedByDeployer) {
        setDeployerName(namesOwnedByDeployer[0]);
      }
    }
  }, [contractAddress]);

  useEffect(() => {
    loadDeployerName();
  }, [loadDeployerName]);

  return deployerName;
};
