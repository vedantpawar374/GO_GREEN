import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
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
    );
}

export default App;