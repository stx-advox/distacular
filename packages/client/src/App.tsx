import "./App.css";
import { AuthOptions, Connect } from "@stacks/connect-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { userSession } from "./constants/stacks-session";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { MainRoutes } from "./routes";

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
    </Connect>
  );
}

export default App;
