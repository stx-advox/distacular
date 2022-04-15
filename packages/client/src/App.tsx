import "./App.css";
import { AuthOptions, Connect } from "@stacks/connect-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { userSession } from "./constants/stacks-session";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { AuthenticatedRoutes } from "./routes";
import { Login } from "./pages";

const queryClient = new QueryClient();

function App() {
  const authOptions: AuthOptions = {
    appDetails: {
      name: "distacular",
      icon: window.location.origin + "/favicon.ico",
    },
    userSession,
  };
  const isLoggedIn = userSession.isUserSignedIn();

  return (
    <Connect authOptions={authOptions}>
      {!isLoggedIn ? (
        <Login />
      ) : (
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <AuthenticatedRoutes />
          </QueryClientProvider>
      )}
    </Connect>
  );
}

export default App;
