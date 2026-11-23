import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
    return (
        <div className="app-container">
            <Navbar />
            <Routes>

                {/* Public Route */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                
                <Route
                    path="/admin-dashboard"
                    element={<AdminDashboard />}
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
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
        </div>
    );
}

export default App;