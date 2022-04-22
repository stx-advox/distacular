import { getProposal, IFormattedProposal } from "@distacular/common";
import { useCallback, useEffect, useState } from "react";

export const useProposal = (contractAddress: string, proposalId: string) => {
  const [proposal, setProposal] = useState<IFormattedProposal>();

  const loadProposal = useCallback(async () => {
    const proposal = await getProposal(contractAddress, Number(proposalId));
    if (proposal) {
      setProposal(proposal);
    }
  }, [contractAddress, proposalId]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);
  return proposal;
};
