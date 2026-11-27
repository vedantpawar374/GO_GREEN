import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const savedTheme =
    localStorage.getItem("gogreen-theme") === "light" ? "light" : "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

createRoot(document.getElementById("root")).render(
    <StrictMode>

        <BrowserRouter>

            <AuthProvider>

                <App />

            </AuthProvider>

        </BrowserRouter>

    </StrictMode>
);