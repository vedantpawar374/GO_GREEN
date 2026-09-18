import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            const response = await loginUser(
                email,
                password
            );

            localStorage.setItem(
                "token",
                response.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.user)
            );

            login(response.user);

            setMessage("Login successful");

            if (response.user.role === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h1>GoGreen Login</h1>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                />

                <button type="submit">
                    Login
                </button>

            </form>

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

        </div>
    );
}

export default Login;