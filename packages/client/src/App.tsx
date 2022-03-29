import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SendSTXView from "./routes/SendSTXView";
import {
    AppConfig,
    AuthOptions,
    Connect,
    useConnect,
    UserData,
    UserSession,
} from "@stacks/connect-react";
import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";
import { useState } from "react";
import { useEffect } from "react";

const appConfig = new AppConfig(["store_write", "publish_data"]);

const userSession = new UserSession({ appConfig });

function App() {
    const [userData, setUserData] = useState<UserData>();

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            const data = userSession.loadUserData();
            setUserData(data);
        }
    }, []);
    const authOptions: AuthOptions = {
        appDetails: {
            name: "distacular",
            icon: window.location.origin + "/favicon.ico",
        },
        userSession,
        onFinish(payload) {
            console.log("calling...", payload);
            setUserData(payload.userSession.loadUserData());
        },
    };

    return (
        <Connect authOptions={authOptions}>
            <BrowserRouter>
                <Routes>
                    {userData ? (
                        <>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/send-stx/:txId"
                                element={<SendSTXView />}
                            />
                        </>
                    ) : (
                        <Route path="/" element={<Login />} />
                    )}

                    {/* <Route index element={<Home />} /> */}
                    {/* <Route path="teams" element={<Teams />}>
                    <Route path=":teamId" element={<Team />} />
                    <Route path="new" element={<NewTeamForm />} />
                    <Route index element={<LeagueStandings />} />
                </Route> */}
                    {/* </Route> */}
                </Routes>
            </BrowserRouter>
        </Connect>
    );
}

const Home = () => {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>I know this is react boilerplate, thank you.</p>
                <a
                    className="App-link"
                    href="https://discord.com/oauth2/authorize?client_id=957992867954045059&permissions=0&scope=bot%20applications.commands"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Invite bot to server
                </a>
            </header>
        </div>
    );
};
const Login = () => {
    const { authenticate, authOptions, userSession } = useConnect();
    const login = () => {
        authenticate(authOptions);
    };
    console.log(userSession);
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

export default App;
