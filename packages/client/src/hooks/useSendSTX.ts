import { useQuery } from "react-query";
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { IGetSendSTXResponse } from "../types";
import { openSTXTransfer } from "@stacks/connect-react";
import { StacksMainnet } from "@stacks/network";

export const useSendSTX = () => {
  const { txId } = useParams<{ txId: string }>();

  const { data: txData, status } = useQuery<IGetSendSTXResponse, Error>(
    ["send-stx", txId],
    () =>
      fetch(`${process.env.REACT_APP_ENDPOINT}/api/send-stx/${txId}`).then(
        (data) => data.json()
      ),
    {
      enabled: !!txId,
      staleTime: 0,
      cacheTime: 0,
      retry: 0,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  );

  const confirmSendSTX = useCallback(() => {
    if (txData) {
      openSTXTransfer({
        ...txData,
        amount: String(txData.amount),
        network: new StacksMainnet(),
      });
    }
  }, [txData]);
  return {
    txData,
    confirmSendSTX,
    status,
  };
};
