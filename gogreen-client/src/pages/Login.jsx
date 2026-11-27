import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function PasswordVisibilityIcon({ isVisible }) {
    return isVisible ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.5 4.5 9.5 6-.4.6-1.6 2.2-3.5 3.6M6.2 6.2C3.9 7.5 2.7 9.5 2.5 10c1 1.5 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    );
}

function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState(
        () => location.state?.prefillEmail ?? "",
    );
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const message = location.state?.registrationMessage
        ? "Account created successfully! Please sign in."
        : "";

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");

        const normalizedEmail = email.trim();
        if (!normalizedEmail || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await loginUser(normalizedEmail, password);

            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            login(response.user);

            navigate(
                response.user.role === "admin"
                    ? "/admin-dashboard"
                    : "/dashboard",
                { replace: true },
            );
        } catch (loginError) {
            setError(loginError.message || "Unable to sign in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card glass-panel" aria-labelledby="login-title">
                <div className="auth-brand" aria-label="GoGreen">
                    <span aria-hidden="true">🌱</span>
                    <span>GoGreen</span>
                </div>
                <h1 id="login-title">Welcome Back</h1>
                <p className="auth-subtitle">
                    Sign in to track your verified carbon savings.
                </p>

                {message && (
                    <div className="auth-alert success" role="status">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="auth-alert error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleLogin} noValidate>
                    <div className="auth-field">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="login-password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="login-password"
                                name="password"
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() =>
                                    setIsPasswordVisible((visible) => !visible)
                                }
                                aria-label={
                                    isPasswordVisible
                                        ? "Hide password"
                                        : "Show password"
                                }
                                aria-pressed={isPasswordVisible}
                            >
                                <PasswordVisibilityIcon
                                    isVisible={isPasswordVisible}
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;
