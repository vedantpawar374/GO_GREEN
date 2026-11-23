const API_BASE_URL = "http://localhost:5000/api";

export async function getLeaderboard() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found");
    }

    const response = await fetch(
        `${API_BASE_URL}/users/leaderboard`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(
            responseData.message ||
            "Unable to retrieve leaderboard"
        );
    }

    return responseData;
}

export async function getAdminAnalytics() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found");
    }

    const response = await fetch(
        `${API_BASE_URL}/users/admin-analytics`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(
            responseData.message ||
            "Unable to retrieve admin analytics"
        );
    }

    return responseData;
}
