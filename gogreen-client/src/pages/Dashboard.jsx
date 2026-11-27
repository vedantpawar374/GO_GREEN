import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CarbonCalculator from "../components/CarbonCalculator";
import { getMyActivities } from "../services/activityService";

const transportIcons = {
    walking: "🚶",
    bicycle: "🚲",
    train: "🚆",
    bus: "🚌",
    bike: "🏍️",
    car: "🚗",
};

function formatTransportName(transport) {
    return transport
        ? transport.charAt(0).toUpperCase() + transport.slice(1)
        : "Unknown";
}

function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function Dashboard() {

    const { user } = useAuth();

    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [activityError, setActivityError] = useState("");
    const [activityRefreshKey, setActivityRefreshKey] = useState(0);
    const [comingSoonNotice, setComingSoonNotice] = useState(null);
    const streak = useMemo(() => {
        const activeDates = new Set(
            activities
                .map((activity) => new Date(activity.createdAt))
                .filter((date) => !Number.isNaN(date.getTime()))
                .map(getLocalDateKey),
        );
        const totalDays = activeDates.size;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentDate = new Date(today);

        if (!activeDates.has(getLocalDateKey(currentDate))) {
            if (!activeDates.has(getLocalDateKey(yesterday))) {
                return { currentDays: 0, totalDays };
            }
            currentDate.setTime(yesterday.getTime());
        }

        let currentDays = 0;
        while (activeDates.has(getLocalDateKey(currentDate))) {
            currentDays += 1;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return { currentDays, totalDays };
    }, [activities]);

    useEffect(() => {
        if (!comingSoonNotice) return undefined;

        const timeoutId = window.setTimeout(
            () => setComingSoonNotice(null),
            3500,
        );
        return () => window.clearTimeout(timeoutId);
    }, [comingSoonNotice]);

    useEffect(() => {

        async function fetchActivities() {

            try {

                setLoadingActivities(true);
                setActivityError("");

                const response = await getMyActivities();

                setActivities(response.activities || []);

            } catch (error) {

                console.error(
                    "Unable to fetch activities:",
                    error
                );

                setActivityError(error.message);

            } finally {

                setLoadingActivities(false);

            }
        }

        fetchActivities();

    }, [activityRefreshKey]);


    return (
        <main className="dashboard">

            {/* Welcome Section */}
            <section className="dashboard-header">

                <h1>
                    Welcome, {user?.name} 👋
                </h1>

                <p>
                    Track your environmental impact and
                    make every activity count.
                </p>

            </section>


            {/* Summary Cards */}
            <section className="dashboard-stats">

                <div className="stat-card">

                    <h3>
                        Total Carbon Saved
                    </h3>

                    <p>
                        {Number(user?.totalCarbonSaved || 0).toFixed(2)} kg CO₂
                    </p>

                </div>


                <div className="stat-card">

                    <h3>
                        Green Points
                    </h3>

                    <p>
                        {user?.walletPoints ?? 0}
                    </p>

                </div>


                <div className="stat-card">

                    <h3>
                        Activities
                    </h3>

                    <p>
                        {activities.length}
                    </p>

                </div>

                <div className="stat-card">

                    <h3>
                        Active Streak 🔥
                    </h3>

                    <p>
                        {streak.currentDays}{" "}
                        {streak.currentDays === 1 ? "Day" : "Days"}
                    </p>
                    <small className="stat-card-subtitle">
                        Active on {streak.totalDays} days total
                    </small>

                </div>

            </section>

            <section
                className="category-showcase-bar"
                aria-label="Activity categories"
            >
                {[
                    { name: "Travel", icon: "travel" },
                    { name: "Electricity", icon: "electricity" },
                    { name: "Water", icon: "water" },
                    { name: "Waste", icon: "waste" },
                    { name: "Fossil Fuel", icon: "fuel" },
                    { name: "Fugitive", icon: "fugitive" },
                    { name: "Offset", icon: "offset" },
                ].map((category, index) => (
                    <button
                        type="button"
                        className={`category-showcase-tab${index === 0 ? " is-active" : ""}`}
                        key={category.name}
                        title={
                            index === 0
                                ? undefined
                                : "Coming soon in Phase 2"
                        }
                        aria-pressed={index === 0}
                        onClick={() =>
                            index === 0
                                ? setComingSoonNotice(null)
                                : setComingSoonNotice({
                                      category: category.name,
                                  })
                        }
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                        >
                            {category.icon === "travel" && (
                                <>
                                    <circle cx="12" cy="12" r="8.5" />
                                    <path d="m14.8 9.2-1.9 3.7-3.7 1.9 1.9-3.7 3.7-1.9Z" />
                                </>
                            )}
                            {category.icon === "electricity" && (
                                <path d="M13.2 2.8 5.7 13h5.1l-.5 8.2L18.3 11h-5.2l.1-8.2Z" />
                            )}
                            {category.icon === "water" && (
                                <>
                                    <path d="M12 3.2s6.3 6.7 6.3 11.1a6.3 6.3 0 1 1-12.6 0C5.7 9.9 12 3.2 12 3.2Z" />
                                    <path d="M9 15.2a3.1 3.1 0 0 0 3.1 3.1" />
                                </>
                            )}
                            {category.icon === "waste" && (
                                <>
                                    <path d="M4.5 7h15" />
                                    <path d="m6.5 7 .9 13h9.2l.9-13" />
                                    <path d="M9 7V4h6v3M10 10v7m4-7v7" />
                                </>
                            )}
                            {category.icon === "fuel" && (
                                <>
                                    <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
                                    <path d="M4 21h12M8 7h4v5H8zM15 8h2l2 2v7a2 2 0 0 1-4 0v-4" />
                                </>
                            )}
                            {category.icon === "fugitive" && (
                                <>
                                    <path d="M12 3v4m0 10v4M3 12h4m10 0h4" />
                                    <path d="m5.6 5.6 2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8" />
                                    <circle cx="12" cy="12" r="3" />
                                </>
                            )}
                            {category.icon === "offset" && (
                                <>
                                    <path d="M12 21v-8" />
                                    <path d="M12 14c-5.5 0-8-3.2-8-8 5.5 0 8 2.5 8 8Z" />
                                    <path d="M12 17c0-5.5 2.5-8 8-8 0 4.8-2.5 8-8 8Z" />
                                </>
                            )}
                        </svg>
                        <span>{category.name}</span>
                    </button>
                ))}
            </section>

            {/* Carbon Calculator */}
            <section className="calculator-section">

                <h2>
                    Log &amp; Calculate Eco-Activity
                </h2>

                <p>
                    Add your activity, review its impact, and send proof for admin verification.
                </p>

                <CarbonCalculator
                    onActivitySubmitted={() => setActivityRefreshKey((key) => key + 1)}
                />

            </section>


            {/* Recent Activities */}
            <section className="recent-activities">

                <h2>
                    Recent Activities
                </h2>

                {loadingActivities && (
                    <p>
                        Loading activities...
                    </p>
                )}

                {activityError && (
                    <p>
                        {activityError}
                    </p>
                )}

                {!loadingActivities &&
                    !activityError &&
                    activities.length === 0 && (
                        <p>
                            You haven't submitted any activities yet.
                        </p>
                    )
                }


                {!loadingActivities &&
                    !activityError &&
                    activities.length > 0 && (

                    <div className="activity-list">

                        {activities.map((activity) => (

                            <div
                                className="activity-card"
                                key={activity._id}
                            >
                                <div className="activity-card-top">
                                    <h3>{activity.description}</h3>
                                    <span
                                        className={`activity-status-badge ${activity.status}`}
                                    >
                                        {activity.status}
                                    </span>
                                </div>

                                <div className="activity-metadata">
                                    <p className="activity-meta-row">
                                        <span className="activity-meta-label">
                                            How
                                        </span>
                                        <span className="activity-transport">
                                            {transportIcons[activity.usedTransport] ||
                                                "🌱"}{" "}
                                            {formatTransportName(
                                                activity.usedTransport,
                                            )}{" "}
                                            instead of{" "}
                                            {formatTransportName(
                                                activity.alternativeTransport,
                                            )}
                                            {" • "}
                                            {activity.distance} km
                                        </span>
                                    </p>
                                    <p className="activity-meta-row">
                                        <span className="activity-meta-label">
                                            When
                                        </span>
                                        <span>
                                            📅{" "}
                                            {new Date(
                                                activity.createdAt,
                                            ).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </p>
                                    <p className="activity-meta-row">
                                        <span className="activity-meta-label">
                                            Where
                                        </span>
                                        <span className="activity-location">
                                            📍{" "}
                                            {activity.location ||
                                                "Location not recorded"}
                                        </span>
                                    </p>
                                </div>

                                {activity.status === "approved" && (
                                    <div className="activity-impact-footer">
                                        <span>
                                            CO₂ Saved:{" "}
                                            {Number(
                                                activity.carbonSaved || 0,
                                            ).toFixed(2)}{" "}
                                            kg CO₂
                                        </span>
                                        <span>
                                            Points: +{activity.pointsEarned}
                                        </span>
                                    </div>
                                )}

                                {activity.status === "rejected" && (
                                    <p className="activity-rejection-note">
                                        Reason: {activity.rejectionReason}
                                    </p>
                                )}

                            </div>

                        ))}

                    </div>

                )}

            </section>

            {comingSoonNotice && (
                <aside
                    className="category-coming-soon-toast"
                    role="status"
                    aria-live="polite"
                >
                    <div className="category-toast-copy">
                        <h2>{comingSoonNotice.category} — Coming Soon</h2>
                        <p>
                            This category is planned for Phase 2 scalability.
                            Currently, activity logging is active for Travel.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="category-toast-dismiss"
                        aria-label="Dismiss notification"
                        onClick={() => setComingSoonNotice(null)}
                    >
                        ×
                    </button>
                </aside>
            )}

        </main>
    );
}

export default Dashboard;