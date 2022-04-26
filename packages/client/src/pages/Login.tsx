import React, { useContext } from "react";
import { useConnect } from "@stacks/connect-react";
import { Button } from "react-bootstrap";
import logo from '../logo.svg'
import { useNavigate } from "react-router-dom";
import { RouterContext } from "../context/RouterContext";
const Login: React.FC = () => {
  const { authenticate, authOptions } = useConnect();
  const navigate = useNavigate()
  const { from } = useContext(RouterContext)

  const login = () => {
    authenticate(authOptions).then(() => navigate(from));
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>I know this is react boilerplate, thank you.</p>
        <Button variant="primary" size="lg" onClick={login}>
          Login
        </Button>
      </header>
    </div>
  );
};

export default Login;
