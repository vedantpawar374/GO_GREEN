const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

export async function getAdminUsers() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found");
    }

    const response = await fetch(
        `${API_BASE_URL}/users/admin-users`,
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
            "Unable to retrieve admin users"
        );
    }

    return responseData;
}

export async function getMyWalletTransactions() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found");
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/wallet/transactions`,
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
                "Unable to retrieve wallet transactions"
            );
        }

        return responseData;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                "Cannot connect to server. Please ensure backend is running on port 5000.",
                { cause: error }
            );
        }
        throw error;
    }
}
