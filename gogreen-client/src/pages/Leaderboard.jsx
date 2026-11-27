import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/userService";
import { useAuth } from "../context/AuthContext";

function Leaderboard() {
    const { user: currentUser } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchLeaders() {
            try {
                setLoading(true);
                const data = await getLeaderboard();
                setLeaders(data.leaderboard);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaders();
    }, []);

    return (
        <main className="leaderboard-page">
            <div className="leaderboard-header">
                <h1>Global Leaderboard 🏆</h1>
                <p>Top contributors saving the planet with the highest carbon saved.</p>
            </div>

            {loading && <div className="loader">Loading...</div>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <div className="leaderboard-container glass-panel">
                    <div className="leaderboard-list">
                        <div className="leader-row header-row">
                            <div className="rank">Rank</div>
                            <div className="user-details">User</div>
                            <div className="carbon-saved">Carbon Saved</div>
                            <div className="points">Green Points</div>
                        </div>

                        {leaders.map((user, index) => {
                            const isCurrentUser = currentUser?.id === user._id;
                            
                            // Top 3 distinct styles
                            let rankClass = "rank-standard";
                            let medal = `#${index + 1}`;
                            if (index === 0) { rankClass = "rank-first"; medal = "🥇"; }
                            if (index === 1) { rankClass = "rank-second"; medal = "🥈"; }
                            if (index === 2) { rankClass = "rank-third"; medal = "🥉"; }

                            return (
                                <div key={user._id} className={`leader-row ${isCurrentUser ? 'current-user-row' : ''} ${rankClass}`}>
                                    <div className="rank">{medal}</div>
                                    <div className="user-details">
                                        <div className="avatar">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="name">
                                            {user.name} {isCurrentUser && "(You)"}
                                            {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                                        </div>
                                    </div>
                                    <div className="carbon-saved">
                                        <span className="value">
                                            {Number(user.totalCarbonSaved || 0).toFixed(2)}
                                        </span>
                                        <span className="unit">kg CO₂</span>
                                    </div>
                                    <div className="points">
                                        <span className="value">
                                            {Number(user.walletPoints || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </main>
    );
}

export default Leaderboard;
