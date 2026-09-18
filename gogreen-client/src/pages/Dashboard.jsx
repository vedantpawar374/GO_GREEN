import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CarbonCalculator from "../components/CarbonCalculator";
import { getMyActivities } from "../services/activityService";

function Dashboard() {

    const { user } = useAuth();

    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [activityError, setActivityError] = useState("");

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

    }, []);


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
                        {user?.totalCarbonSaved ?? 0} kg CO₂
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

            </section>


            {/* Carbon Calculator */}
            <section className="calculator-section">

                <h2>
                    Calculate Your Carbon Savings
                </h2>

                <p>
                    Tell us about your eco-friendly activity.
                </p>

                <CarbonCalculator />

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

                        {activities.slice(0, 5).map((activity) => (

                            <div
                                className="activity-card"
                                key={activity._id}
                            >

                                <h3>
                                    {activity.description}
                                </h3>

                                <p>
                                    Distance: {activity.distance} km
                                </p>

                                <p>
                                    Status: {activity.status}
                                </p>

                                {activity.status === "approved" && (
                                    <>
                                        <p>
                                            Carbon Saved:
                                            {" "}
                                            {activity.carbonSaved} kg CO₂
                                        </p>

                                        <p>
                                            Points Earned:
                                            {" "}
                                            {activity.pointsEarned}
                                        </p>
                                    </>
                                )}

                                {activity.status === "rejected" && (
                                    <p>
                                        Reason:
                                        {" "}
                                        {activity.rejectionReason}
                                    </p>
                                )}

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </main>
    );
}

export default Dashboard;