import { useEffect, useMemo, useState } from "react";
import { getAdminUsers } from "../services/userService";

const dateTimeOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
};

function formatDateTime(value) {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleString("en-IN", dateTimeOptions);
}

function formatTransportName(transport) {
    return transport
        ? transport.charAt(0).toUpperCase() + transport.slice(1)
        : "Unknown";
}

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("carbon");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        async function loadUsers() {
            try {
                setLoading(true);
                setError("");
                const response = await getAdminUsers();
                setUsers(response.users || []);
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        const matchingUsers = users.filter((user) => {
            const name = user.name?.toLowerCase() || "";
            const email = user.email?.toLowerCase() || "";
            return !query || name.includes(query) || email.includes(query);
        });

        const sortFunctions = {
            carbon: (left, right) =>
                Number(right.totalCarbonSaved || 0) -
                Number(left.totalCarbonSaved || 0),
            points: (left, right) =>
                Number(right.walletPoints || 0) -
                Number(left.walletPoints || 0),
            activities: (left, right) =>
                Number(right.activityCount || 0) -
                Number(left.activityCount || 0),
            name: (left, right) =>
                (left.name || "").localeCompare(right.name || ""),
            newest: (left, right) =>
                new Date(right.createdAt || 0).getTime() -
                new Date(left.createdAt || 0).getTime(),
        };

        return matchingUsers.sort(sortFunctions[sortBy]);
    }, [users, search, sortBy]);

    const selectedUser =
        visibleUsers.find((user) => String(user._id) === selectedUserId) ||
        visibleUsers[0] ||
        null;
    const activities = selectedUser?.activities || [];
    const filteredActivities =
        statusFilter === "all"
            ? activities
            : activities.filter(
                  (activity) => activity.status === statusFilter,
              );
    const statusFilters = ["all", "pending", "approved", "rejected"];

    return (
        <main className="admin-users-page">
            <header className="admin-users-header">
                <div>
                    <p className="admin-eyebrow">Community audit</p>
                    <h1>Community Users &amp; Activity Audit</h1>
                    <p>
                        Review member impact, submissions, and proof in one
                        workspace.
                    </p>
                </div>
                <span className="admin-user-count">
                    {users.length} {users.length === 1 ? "user" : "users"}
                </span>
            </header>

            <div className="admin-users-controls">
                <label className="admin-users-search">
                    <span className="admin-visually-hidden">Search users</span>
                    <span aria-hidden="true">⌕</span>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email..."
                    />
                </label>
                <label className="admin-users-sort">
                    <span>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <option value="carbon">Highest Carbon Saved</option>
                        <option value="points">Highest Green Points</option>
                        <option value="activities">Most Activities</option>
                        <option value="name">Name (A–Z)</option>
                        <option value="newest">Newest Joined</option>
                    </select>
                </label>
            </div>

            {error && (
                <p className="error-message admin-users-error" role="alert">
                    {error}
                </p>
            )}

            {loading ? (
                <div className="loader">Loading community users...</div>
            ) : (
                <div className="admin-users-grid">
                    <section
                        className="admin-users-list-panel"
                        aria-label="Community users"
                    >
                        <div className="admin-users-list-heading">
                            <h2>Users</h2>
                            <span>{visibleUsers.length}</span>
                        </div>
                        {visibleUsers.length > 0 ? (
                            <div className="admin-users-list">
                                {visibleUsers.map((user) => {
                                    const userId = String(user._id);
                                    const isSelected =
                                        userId ===
                                        String(selectedUser?._id || "");

                                    return (
                                        <button
                                            type="button"
                                            className={`admin-user-list-card${isSelected ? " is-selected" : ""}`}
                                            key={userId}
                                            onClick={() =>
                                                setSelectedUserId(userId)
                                            }
                                            aria-pressed={isSelected}
                                        >
                                            <span className="admin-user-avatar">
                                                {user.name
                                                    ?.trim()
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "U"}
                                            </span>
                                            <span className="admin-user-list-copy">
                                                <strong>{user.name}</strong>
                                                <small>{user.email}</small>
                                                <span className="admin-user-list-stats">
                                                    <span>
                                                        {Number(
                                                            user.totalCarbonSaved ||
                                                                0,
                                                        ).toFixed(2)}{" "}
                                                        kg CO₂
                                                    </span>
                                                    <span>
                                                        {Number(
                                                            user.walletPoints ||
                                                                0,
                                                        ).toLocaleString()}{" "}
                                                        pts
                                                    </span>
                                                    <span>
                                                        {user.activityCount || 0}{" "}
                                                        activities
                                                    </span>
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="admin-users-empty">
                                {search
                                    ? "No users match your search."
                                    : "No community users found."}
                            </p>
                        )}
                    </section>

                    <section className="admin-user-detail-panel">
                        {selectedUser ? (
                            <>
                                <header className="admin-user-summary">
                                    <div className="admin-user-summary-heading">
                                        <span className="admin-user-avatar is-large">
                                            {selectedUser.name
                                                ?.trim()
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                        </span>
                                        <div>
                                            <h2>{selectedUser.name}</h2>
                                            <p>{selectedUser.email}</p>
                                            <small>
                                                Joined{" "}
                                                {formatDateTime(
                                                    selectedUser.createdAt,
                                                )}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="admin-user-summary-stats">
                                        <div>
                                            <span>Total CO₂ Saved</span>
                                            <strong>
                                                {Number(
                                                    selectedUser.totalCarbonSaved ||
                                                        0,
                                                ).toFixed(2)}{" "}
                                                kg
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Green Points</span>
                                            <strong>
                                                {Number(
                                                    selectedUser.walletPoints ||
                                                        0,
                                                ).toLocaleString()}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Approved</span>
                                            <strong>
                                                {selectedUser.approvedCount || 0}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Pending</span>
                                            <strong>
                                                {selectedUser.pendingCount || 0}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Rejected</span>
                                            <strong>
                                                {selectedUser.rejectedCount || 0}
                                            </strong>
                                        </div>
                                    </div>
                                </header>

                                <div className="admin-user-activity-heading">
                                    <h3>Activity history</h3>
                                    <span>
                                        {filteredActivities.length}{" "}
                                        {filteredActivities.length === 1
                                            ? "activity"
                                            : "activities"}
                                    </span>
                                </div>

                                <div
                                    className="admin-user-status-filters"
                                    aria-label="Filter activities by status"
                                >
                                    {statusFilters.map((status) => (
                                        <button
                                            type="button"
                                            key={status}
                                            className={
                                                statusFilter === status
                                                    ? "is-active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setStatusFilter(status)
                                            }
                                        >
                                            {status === "all"
                                                ? "All"
                                                : status.charAt(0).toUpperCase() +
                                                  status.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {filteredActivities.length > 0 ? (
                                    <div className="admin-user-activity-list">
                                        {filteredActivities.map((activity) => (
                                            <article
                                                className="admin-user-activity-card"
                                                key={activity._id}
                                            >
                                                <div className="admin-user-activity-main">
                                                    <div className="admin-user-activity-top">
                                                        <h4>
                                                            {activity.description}
                                                        </h4>
                                                        <span
                                                            className={`admin-activity-status ${activity.status}`}
                                                        >
                                                            {activity.status}
                                                        </span>
                                                    </div>
                                                    <p>
                                                        <strong>HOW</strong>
                                                        <span className="admin-activity-transport">
                                                            {formatTransportName(
                                                                activity.usedTransport,
                                                            )}{" "}
                                                            instead of{" "}
                                                            {formatTransportName(
                                                                activity.alternativeTransport,
                                                            )}{" "}
                                                            • {activity.distance}{" "}
                                                            km
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <strong>WHEN</strong>
                                                        <span>
                                                            {formatDateTime(
                                                                activity.createdAt,
                                                            )}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <strong>WHERE</strong>
                                                        <span>
                                                            {activity.location ||
                                                                "Location not recorded"}
                                                        </span>
                                                    </p>
                                                    {activity.status ===
                                                        "approved" && (
                                                        <div className="admin-activity-impact">
                                                            <strong>IMPACT</strong>
                                                            <span>
                                                                {Number(
                                                                    activity.carbonSaved ||
                                                                        0,
                                                                ).toFixed(2)}{" "}
                                                                kg CO₂ saved · +
                                                                {Number(
                                                                    activity.pointsEarned ||
                                                                        0,
                                                                ).toLocaleString()}{" "}
                                                                points
                                                            </span>
                                                        </div>
                                                    )}
                                                    {activity.status ===
                                                        "rejected" && (
                                                        <div className="admin-activity-impact is-rejected">
                                                            <strong>IMPACT</strong>
                                                            <span>
                                                                {activity.rejectionReason ||
                                                                    "No rejection reason provided"}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {activity.status ===
                                                        "pending" && (
                                                        <div className="admin-activity-impact">
                                                            <strong>IMPACT</strong>
                                                            <span>
                                                                Awaiting admin
                                                                review
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {activity.proofImage ? (
                                                    <a
                                                        className="admin-user-proof-link"
                                                        href={`/uploads/${activity.proofImage}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        aria-label={`Open proof image for ${activity.description}`}
                                                    >
                                                        <img
                                                            src={`/uploads/${activity.proofImage}`}
                                                            alt="Activity proof"
                                                            loading="lazy"
                                                        />
                                                        <span>View proof</span>
                                                    </a>
                                                ) : (
                                                    <div className="admin-user-proof-missing">
                                                        No proof image
                                                    </div>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="admin-users-empty">
                                        {activities.length === 0
                                            ? "This user has no activities yet."
                                            : "No activities match this status."}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="admin-users-empty">
                                Select a user to inspect their activity history.
                            </p>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}

export default AdminUsers;
