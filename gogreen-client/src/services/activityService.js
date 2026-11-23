const API_BASE_URL = "http://localhost:5000/api";

export async function submitActivity(activityData) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!(activityData.proofImage instanceof File)) {
        throw new Error("Please upload a JPG, PNG, or WEBP proof image.");
    }

    const formData = new FormData();
    formData.append("description", activityData.description);
    formData.append("distance", activityData.distance);
    formData.append("usedTransport", activityData.usedTransport);
    formData.append(
        "alternativeTransport",
        activityData.alternativeTransport
    );
    formData.append("proofImage", activityData.proofImage);

    try {
        const response = await fetch(`${API_BASE_URL}/activities`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
        });

        const responseText = await response.text();
        let responseData;
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            responseData = {
                message: "The server returned an unexpected response. Please try again.",
            };
        }

        if (!response.ok) {
            throw new Error(
                responseData.message || "Activity submission failed"
            );
        }
        return responseData;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Cannot connect to server. Please ensure backend is running on port 5000.");
        }
        throw error;
    }
}
export async function getPendingActivities() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/activities/pending`
        );
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(
                responseData.message ||
                "Unable to retrieve pending activities"
            );
        }
        return responseData;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Cannot connect to server. Please ensure backend is running on port 5000.");
        }
        throw error;
    }
}

export async function approveActivity(activityId) {
    console.log("This is API_BASE_URL " + API_BASE_URL);
    const response = await fetch(
        `${API_BASE_URL}/activities/${activityId}/approve`,
        {
            method: "PATCH"
        }
    );
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.message ||
            "Unable to approve activity"
        );
    }
    return responseData;
}
export async function rejectActivity(
    activityId,
    rejectReason
) {
    const response = await fetch(
        `${API_BASE_URL}/activities/${activityId}/reject`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rejectReason,
            }),
        }
    );
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.message || "Unable to reject activity");
    }
    return responseData;
}
export async function getMyActivities() {

    try {

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch(
            `${API_BASE_URL}/activities/my`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.message ||
                "Unable to retrieve your activities"
            );
        }

        return responseData;

    } catch (error) {

        if (error instanceof TypeError) {
            throw new Error(
                "Cannot connect to server. Please ensure backend is running on port 5000."
            );
        }

        throw error;
    }
}