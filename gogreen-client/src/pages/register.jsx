import { useState } from "react";
// Assuming you have a registerUser function in your authService similar to loginUser
import { registerUser } from "../services/authService";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    
    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            setError("");
            setMessage("");

            const response = await registerUser(
                name,
                email,
                password
            );
            
            setMessage("Registration successful! You can now login.");
            // Optionally, you can also store the token and login immediately if your backend returns it on registration
            // localStorage.setItem("token", response.token);
            // localStorage.setItem("user", JSON.stringify(response.user));
            
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h1>GoGreen Register</h1>
            <form onSubmit={handleRegister}>
                <input 
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit">
                    Register
                </button>
            </form>
            {error && <p>{error}</p>}
            {message && <p>{message}</p>}
        </div>
    );
}

export default Register;
