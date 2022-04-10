import { useQuery } from "react-query";
import { IGetFundingProposalData } from "../types";

export const getFundingProposal = (id?: string) => {
  const result = useQuery<IGetFundingProposalData, Error>(
    ["funding-proposal", id],
    () =>
      fetch(`${process.env.REACT_APP_ENDPOINT}/api/funding-proposal/${id}`)
        .then((data) => data.json())
        .then((data) => data),
    {
      enabled: !!id,
    }
  );
  return result;
};
