import React from "react";
import { useConnect } from "@stacks/connect-react";
import { Button } from "react-bootstrap";
import logo from '../logo.svg'
const Login: React.FC = () => {
  const { authenticate, authOptions } = useConnect();
  const login = () => {
    authenticate(authOptions).then(() => window.location.reload());
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
