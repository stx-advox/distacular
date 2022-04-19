import React from "react";
import { Navigate } from "react-router-dom";
import { userSession } from "../constants/stacks-session";

export const PrivateRoute: React.FC = ({ children }) => {
  const isLoggedIn = userSession.isUserSignedIn();

  return (
    <React.Fragment>
      {" "}
      {isLoggedIn ? children : <Navigate to={"/login"} />}{" "}
    </React.Fragment>
  );
};

export default PrivateRoute;
