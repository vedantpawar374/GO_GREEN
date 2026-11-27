import { useEffect, useState } from "react";
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
    const { user, isAuthenticated } = useAuth();
    const authenticatedLanding =
        user?.role === "admin" ? "/admin-dashboard" : "/dashboard";
    const [theme, setTheme] = useState(() =>
        document.documentElement.getAttribute("data-theme") === "light"
            ? "light"
            : "dark",
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("gogreen-theme", theme);
    }, [theme]);

    const onToggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
        );
    };

    const routes = (
        <Routes>

            {/* Public Route */}
            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate to={authenticatedLanding} replace />
                        : <Login />
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated
                        ? <Navigate to={authenticatedLanding} replace />
                        : <Register />
                }
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/dashboard"
                    element={
                        user?.role === "admin"
                            ? <Navigate to="/admin-dashboard" replace />
                            : <Dashboard />
                    }
                />
                
                <Route
                    path="/admin-dashboard"
                    element={
                        user?.role === "admin"
                            ? <AdminDashboard />
                            : <Navigate to="/dashboard" replace />
                    }
                />

                <Route
                    path="/admin-users"
                    element={
                        user?.role === "admin"
                            ? <AdminUsers />
                            : <Navigate to="/dashboard" replace />
                    }
                />

                <Route
                    path="/wallet"
                    element={
                        user?.role === "admin"
                            ? <Navigate to="/admin-dashboard" replace />
                            : <Wallet />
                    }
                />
                
                <Route
                    path="/leaderboard"
                    element={<Leaderboard />}
                />

            </Route>

            {/* Unknown URL */}
            <Route
                path="*"
                element={
                    <Navigate
                        to={
                            user?.role === "admin"
                                ? "/admin-dashboard"
                                : "/login"
                        }
                        replace
                    />
                }
            />

        </Routes>
    );

    if (isAuthenticated && user) {
        return (
            <div className="app-layout-shell">
                <Navbar theme={theme} onToggleTheme={onToggleTheme} />
                <div className="app-main-content">
                    {routes}
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Navbar theme={theme} onToggleTheme={onToggleTheme} />
            {routes}
        </div>
    );
}

export default App;