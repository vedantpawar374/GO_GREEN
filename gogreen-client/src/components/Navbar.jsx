import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ThemeIcon({ theme }) {
    if (theme === "dark") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
        </svg>
    );
}

function Navbar({ theme = "dark", onToggleTheme = () => {} }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(max-width: 767px)").matches,
    );
    const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
    const userRole = user?.role;

    useEffect(() => {
        if (!userRole) return undefined;

        const mediaQuery = window.matchMedia("(max-width: 767px)");
        const updateMobileState = (event) => setIsMobile(event.matches);
        mediaQuery.addEventListener("change", updateMobileState);

        return () =>
            mediaQuery.removeEventListener("change", updateMobileState);
    }, [userRole]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) {
        const label =
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
        return (
            <button
                type="button"
                className="theme-toggle theme-toggle-floating"
                onClick={onToggleTheme}
                title={label}
                aria-label={label}
            >
                <ThemeIcon theme={theme} />
            </button>
        );
    }

    const sidebarCollapsed = isCollapsed || isMobile;
    const navigationItems =
        user.role === "admin"
            ? [
                  {
                      to: "/admin-dashboard",
                      label: "Admin",
                      icon: "◫",
                      end: true,
                  },
                  { to: "/admin-users", label: "Users", icon: "👥" },
                  {
                      to: "/leaderboard",
                      label: "Leaderboard",
                      icon: "🏆",
                  },
              ]
            : [
                  {
                      to: "/dashboard",
                      label: "Dashboard",
                      icon: "⌂",
                      end: true,
                  },
                  {
                      to: "/wallet",
                      label: "Wallet & Rewards",
                      icon: "🪙",
                  },
                  {
                      to: "/leaderboard",
                      label: "Leaderboard",
                      icon: "🏆",
                  },
              ];
    const profileCard = (
        <div className="profile-card" role="dialog" aria-label="User profile">
            <div className="profile-card-header">
                <span className="profile-card-avatar" aria-hidden="true">
                    {userInitial}
                </span>
                <h2 className="profile-card-name">{user.name}</h2>
                <p className="profile-card-email">{user.email}</p>
                <div className="profile-card-meta">
                    <span className="profile-role">{user.role}</span>
                    <span className="profile-points">
                        🪙 {user.walletPoints ?? 0} Green Points
                    </span>
                </div>
            </div>
            <div className="profile-card-footer">
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <aside
            className={`admin-sidebar${sidebarCollapsed ? " is-collapsed" : ""}`}
        >
            <div className="admin-sidebar-top">
                <div className="admin-sidebar-brand-row">
                    <Link
                        to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"}
                        className="admin-sidebar-brand"
                        title={sidebarCollapsed ? "GoGreen" : undefined}
                    >
                        <span aria-hidden="true">🌱</span>
                        {!sidebarCollapsed && (
                            <span className="admin-sidebar-brand-name">
                                GoGreen
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        className="admin-sidebar-toggle"
                        onClick={() =>
                            setIsCollapsed((collapsed) => !collapsed)
                        }
                        aria-label={
                            sidebarCollapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        title={
                            sidebarCollapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        ☰
                    </button>
                </div>

                <nav
                    className="admin-sidebar-nav"
                    aria-label={`${user.role === "admin" ? "Admin" : "User"} navigation`}
                >
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-sidebar-link${isActive ? " is-active" : ""}`
                            }
                            title={sidebarCollapsed ? item.label : undefined}
                            aria-label={item.label}
                        >
                            <span className="admin-sidebar-icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            {!sidebarCollapsed && (
                                <span className="admin-sidebar-label">
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="admin-sidebar-bottom">
                <button
                    type="button"
                    className="theme-toggle admin-sidebar-theme-toggle"
                    onClick={onToggleTheme}
                    title={
                        sidebarCollapsed
                            ? theme === "dark"
                                ? "Switch to Light Mode"
                                : "Switch to Dark Mode"
                            : undefined
                    }
                    aria-label={
                        theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
                    }
                >
                    <ThemeIcon theme={theme} />
                    {!sidebarCollapsed && (
                        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    )}
                </button>
                <div
                    className={`profile-menu-wrapper admin-profile-menu${isProfileOpen ? " is-open" : ""}`}
                    onBlur={(event) => {
                        if (
                            !event.currentTarget.contains(event.relatedTarget)
                        ) {
                            setIsProfileOpen(false);
                        }
                    }}
                >
                    <button
                        type="button"
                        className="admin-profile-trigger"
                        title={sidebarCollapsed ? user.name : undefined}
                        aria-label="Open profile menu"
                        aria-haspopup="true"
                        aria-expanded={isProfileOpen}
                        onFocus={(event) => {
                            if (event.currentTarget.matches(":focus-visible")) {
                                setIsProfileOpen(true);
                            }
                        }}
                        onClick={() =>
                            setIsProfileOpen((open) => !open)
                        }
                    >
                        <span
                            className="profile-avatar-button admin-sidebar-avatar"
                            aria-hidden="true"
                        >
                            {userInitial}
                        </span>
                        {!sidebarCollapsed && (
                            <span className="admin-profile-copy">
                                <strong>{user.name}</strong>
                                {user.role === "admin" ? (
                                    <small>Admin</small>
                                ) : (
                                    <small className="sidebar-wallet-points">
                                        🪙 {user.walletPoints ?? 0}
                                    </small>
                                )}
                            </span>
                        )}
                    </button>
                    {profileCard}
                </div>
            </div>
        </aside>
    );
}

export default Navbar;
