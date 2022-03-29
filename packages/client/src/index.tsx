import React from "react";
import { render } from "react-dom";
import App from "./App";
import "./index.css";

// import your route components too

render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
