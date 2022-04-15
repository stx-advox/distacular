import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
const Home = React.lazy(() => import("../pages/Home"));
const ExecuteFundingProposalView = React.lazy(
  () => import("../pages/ExecuteFundingProposal")
);
const SendSTXView = React.lazy(() => import("../pages/SendSTXView"));
const MicroDAODepositView = React.lazy(() => import("../pages/mDAODeposit"));
const DissentView = React.lazy(() => import("../pages/Dissent"));
const CreateFundingProposalView = React.lazy(
  () => import("../pages/CreateFundingProposal")
);
const CreateMicroDAOView = React.lazy(() => import("../pages/CreateMicroDAO"));

const AuthenticatedRoutes: React.FC = () => {
  return (
    <Suspense fallback={"loading"}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send-stx/:txId" element={<SendSTXView />} />
          <Route
            path="/create-micro-dao/:daoId"
            element={<CreateMicroDAOView />}
          />
          <Route
            path="/deposit-micro-dao/:contractAddress/:amount"
            element={<MicroDAODepositView />}
          />
          <Route
            path="/create-funding-proposal/:id"
            element={<CreateFundingProposalView />}
          />
          <Route
            path="/dissent-micro-dao/:contractAddress/:proposalId"
            element={<DissentView />}
          />
          <Route
            path="/execute-funding-proposal/:contractAddress/:proposalId"
            element={<ExecuteFundingProposalView />}
          />
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="teams" element={<Teams />}>
                  <Route path=":teamId" element={<Team />} />
                  <Route path="new" element={<NewTeamForm />} />
                  <Route index element={<LeagueStandings />} />
              </Route> */}
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default AuthenticatedRoutes;
