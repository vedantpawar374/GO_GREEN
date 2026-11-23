import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return null;

    return (
        <nav className="glass-navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="nav-brand">
                    <span className="brand-icon">🌱</span> GoGreen
                </Link>
                
                <div className="nav-links">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
                    {user.role === "admin" && (
                        <Link to="/admin-dashboard" className="nav-link admin-link">Admin</Link>
                    )}
                </div>

                <div className="nav-user">
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-points">🪙 {user.walletPoints}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
