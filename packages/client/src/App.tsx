import "./App.css";
import { AuthOptions, Connect } from "@stacks/connect-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { userSession } from "./constants/stacks-session";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { MainRoutes } from "./routes";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

function App() {
  const authOptions: AuthOptions = {
    appDetails: {
      name: "distacular",
      icon: window.location.origin + "/favicon.ico",
    },
    userSession,
  };

  return (
    <Connect authOptions={authOptions}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <MainRoutes />
      </QueryClientProvider>
      <ToastContainer />
    </Connect>
  );
}

export default App;
