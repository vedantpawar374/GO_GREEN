import { useEffect, useState } from "react";
import AdminPendingActivities from "../components/AdminPendingActivities";
import { getAdminAnalytics } from "../services/userService";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      const response = await getAdminAnalytics();
      setAnalytics(response.analytics);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: analytics?.totalUsers ?? "-",
      className: "users",
    },
    {
      label: "Pending Activities",
      value: analytics?.pendingActivities ?? "-",
      className: "pending",
    },
    {
      label: "Total Carbon Saved",
      value: analytics
        ? `${Number(analytics.totalCarbonSaved).toFixed(2)} kg`
        : "-",
      className: "carbon",
    },
    {
      label: "Wallet Points",
      value: analytics?.totalWalletPoints ?? "-",
      className: "points",
    },
  ];

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <p className="admin-eyebrow">Operations overview</p>
        <h1>Admin Dashboard</h1>
        <p>Monitor community activity and environmental impact.</p>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section className="admin-analytics" aria-label="Platform analytics">
        {cards.map((card) => (
          <article
            className={`admin-stat-card ${card.className}`}
            key={card.label}
          >
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <AdminPendingActivities onActivityUpdated={loadAnalytics} />
    </main>
  );
}

export default AdminDashboard;
