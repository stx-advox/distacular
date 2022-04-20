import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
import PrivateRoute from "./PrivateRoute";
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
const Login = React.lazy(() => import("../pages/Login"));

const MainRoutes: React.FC = () => {
  return (
    <Suspense fallback={"loading"}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute children={<Home />} />} />
          <Route
            path="/create-micro-dao/:daoId"
            element={<PrivateRoute children={<CreateMicroDAOView />} />}
          />
          <Route
            path="/deposit-micro-dao/:contractAddress/:tokenContractAddress/:amount"
            element={<PrivateRoute children={<MicroDAODepositView />} />}
          />
          <Route
            path="/create-funding-proposal/:id"
            element={<PrivateRoute children={<CreateFundingProposalView />} />}
          />
          <Route
            path="/dissent-micro-dao/:contractAddress/:proposalId"
            element={<PrivateRoute children={<DissentView />} />}
          />
          <Route
            path="/execute-funding-proposal/:contractAddress/:proposalId"
            element={<PrivateRoute children={<ExecuteFundingProposalView />} />}
          />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default MainRoutes;
