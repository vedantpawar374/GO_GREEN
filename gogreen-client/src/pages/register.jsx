import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

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

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();
        if (
            !normalizedName ||
            !normalizedEmail ||
            !password.trim() ||
            !confirmPassword
        ) {
            setError("Please complete all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await registerUser(normalizedName, normalizedEmail, password);
            navigate("/login", {
                state: {
                    registrationMessage:
                        "Registration successful! Please log in with your new account.",
                    prefillEmail: normalizedEmail,
                },
            });
        } catch (registrationError) {
            setError(
                registrationError.message ||
                    "Unable to create your account. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section
                className="auth-card glass-panel"
                aria-labelledby="register-title"
            >
                <div className="auth-brand" aria-label="GoGreen">
                    <span aria-hidden="true">🌱</span>
                    <span>GoGreen</span>
                </div>
                <h1 id="register-title">Create Account</h1>
                <p className="auth-subtitle">
                    Join GoGreen to log eco-activities and earn Green Points.
                </p>

                {error && (
                    <div className="auth-alert error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleRegister} noValidate>
                    <div className="auth-field">
                        <label htmlFor="register-name">Full Name</label>
                        <input
                            id="register-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Your full name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="register-email">Email</label>
                        <input
                            id="register-email"
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
                        <label htmlFor="register-password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="register-password"
                                name="password"
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                minLength={6}
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

                    <div className="auth-field">
                        <label htmlFor="register-confirm-password">
                            Confirm Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="register-confirm-password"
                                name="confirmPassword"
                                type={
                                    isConfirmPasswordVisible
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="new-password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() =>
                                    setIsConfirmPasswordVisible((visible) => !visible)
                                }
                                aria-label={
                                    isConfirmPasswordVisible
                                        ? "Hide confirmation password"
                                        : "Show confirmation password"
                                }
                                aria-pressed={isConfirmPasswordVisible}
                            >
                                <PasswordVisibilityIcon
                                    isVisible={isConfirmPasswordVisible}
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;
