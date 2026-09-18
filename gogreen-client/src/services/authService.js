const API_BASE_URL = "http://localhost:5000/api";

export async function loginUser(email, password) {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(
            responseData.message || "Login Failed."
        );
    }
    return responseData;

}

export async function registerUser(name, email, password) {
    const response = await fetch( `${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Something went wrong during registration");
    }
    return data;
}
export async function getCurrentUser() {

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found");
    }

    const response = await fetch(
        `${API_BASE_URL}/users/me`,
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
            "Unable to retrieve current user"
        );
    }

    return responseData;
}