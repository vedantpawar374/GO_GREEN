import { useEffect, useState } from "react";
import {
    getPendingActivities,
    approveActivity,
    rejectActivity,
} from "../services/activityService";

function AdminPendingActivities({ refreshTrigger, onActivityUpdated }) {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingActivityId, setProcessingActivityId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function loadPendingActivities() {
            try {
                setIsLoading(true);
                setError("");

                const response = await getPendingActivities();

                setActivities(response.activities);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadPendingActivities();
    }, [refreshTrigger]);

    if (isLoading) {
        return null;
    }

    if (error) {
        return (
            <p className="error-message admin-activities-error">{error}</p>
        );
    }
    const handleApprove = async (activityId) => {
        const confirmed = window.confirm(
            "Are you sure you want to approve this activity?",
        );
        if (!confirmed) {
            return;
        }
        try {
            setProcessingActivityId(activityId);
            setError("");
            setSuccessMessage("");
            const response = await approveActivity(activityId);

            setActivities((currentActivities) =>
                currentActivities.filter(
                    (activity) => activity._id !== activityId,
                ),
            );
            setSuccessMessage(response.message);
            onActivityUpdated?.();
        } catch (error) {
            setError(error.message);
        } finally {
            setProcessingActivityId(null);
        }
    };
    const handleReject = async (activityId) => {
        const rejectionReason = window.prompt(
            "Enter the reason for rejecting this activity:",
        );
        if (rejectionReason == null) {
            return;
        }
        if (!rejectionReason.trim()) {
            setError("Rejection reason is required");
            return;
        }
        try {
            setProcessingActivityId(activityId);
            setError(" ");
            setSuccessMessage("");
            const response = await rejectActivity(activityId, rejectionReason);
            setActivities((currentActivities) =>
                currentActivities.filter(
                    (activity) => activity._id !== activityId,
                ),
            );
            setSuccessMessage(response.message);
            onActivityUpdated?.();
        } catch (error) {
            setError(error.message);
        } finally {
            setProcessingActivityId(null);
        }
    };

    return (
        <>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}

            {activities.length > 0 && (
                <div className="activity-list">
                    {activities.map((activity) => (
                        <article className="activity-card" key={activity._id}>
                            <div className="activity-information">
                                <span className="status-badge">
                                    {activity.status}
                                </span>

                                <h2>{activity.description}</h2>

                                <p>
                                    <strong>Distance:</strong>{" "}
                                    {activity.distance} km
                                </p>

                                <p>
                                    <strong>Transport used:</strong>{" "}
                                    {activity.usedTransport}
                                </p>

                                <p>
                                    <strong>Transport avoided:</strong>{" "}
                                    {activity.alternativeTransport}
                                </p>

                                <p>
                                    <strong>Submitted:</strong>{" "}
                                    {new Date(
                                        activity.createdAt,
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div className="proof-section">
                                <p>
                                    <strong>Proof image</strong>
                                </p>

                                <img
                                    src={`http://localhost:5000/uploads/${activity.proofImage}`}
                                    alt="Submitted activity proof"
                                    className="admin-proof-image"
                                />
                            </div>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    className="approve-button"
                                    onClick={() => handleApprove(activity._id)}
                                    disabled={
                                        processingActivityId === activity._id
                                    }
                                >
                                    {processingActivityId === activity._id
                                        ? "Processing..."
                                        : "Approve"}
                                </button>

                                <button
                                    type="button"
                                    className="reject-button"
                                    onClick={() => handleReject(activity._id)}
                                    disabled={
                                        processingActivityId === activity._id
                                    }
                                >
                                    Reject
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </>
    );
}

export default AdminPendingActivities;
