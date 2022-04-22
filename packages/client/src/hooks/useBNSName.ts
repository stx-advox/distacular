import { useCallback, useEffect, useState } from "react";
import { NamesApi } from "@stacks/blockchain-api-client";

const pickName = (names: string[]) => {
  if (names.length === 1) {
    return names[0];
  }
  const btcName = names.find((name) => name.endsWith(".btc"));
  if (btcName) {
    return btcName;
  }
  const stxName = names.find((name) => name.endsWith(".stx"));
  if (stxName) {
    return stxName;
  }
  return names[0];
};

export const useBNSName = (address?: string) => {
  const [bnsName, setBNSName] = useState<string>();

  const loadBNSName = useCallback(async () => {
    if (address) {
      const api = new NamesApi();
      const namesOwnedByAddress = (
        await api.getNamesOwnedByAddress({
          address,
          blockchain: "stacks",
        })
      ).names;
      if (namesOwnedByAddress) {
        const name = pickName(namesOwnedByAddress);
        setBNSName(name);
      }
    }
  }, [address]);

  useEffect(() => {
    loadBNSName();
  }, [loadBNSName]);

  return bnsName;
};
