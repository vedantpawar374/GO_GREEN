import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyWalletTransactions } from "../services/userService";

const rewardTiers = [
    { points: 500, name: "Local B2B Merchant Discounts" },
    { points: 1000, name: "Eco-Shopping & Affiliate Deals" },
    { points: 1500, name: "Verified Green Impact Certificate" },
    { points: 2500, name: "Community Impact Milestone" },
];

const rewardOptions = [
    {
        title: "Local B2B Merchant Discounts",
        points: 500,
        description:
            "Redeem points for discount vouchers at partnered local stores, cafes, and campus merchants.",
    },
    {
        title: "Eco-Shopping & Affiliate Deals",
        points: 1000,
        description:
            "Unlock curated deals on reusable bottles, cloth bags, and cycling gear via partner stores such as Amazon and Flipkart.",
    },
    {
        title: "Verified Green Impact Certificate",
        points: 1500,
        description:
            "Download an institution-ready Carbon Saver & Tree Plantation Certificate backed by your verified CO₂ savings.",
    },
];

function formatTransactionType(type = "") {
    return type
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatTransactionDate(value) {
    if (!value) return "Date not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date not available";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function Wallet() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTransactions() {
            try {
                setIsLoading(true);
                setError("");
                const response = await getMyWalletTransactions();
                setTransactions(response.transactions || []);
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadTransactions();
    }, []);

    const balance = Number(user?.walletPoints || 0);
    const nextTier = rewardTiers.find((tier) => balance < tier.points);
    const tierProgress = useMemo(() => {
        if (!nextTier) return 100;
        return Math.min(100, Math.max(0, (balance / nextTier.points) * 100));
    }, [balance, nextTier]);
    const pointsAway = nextTier ? Math.max(0, nextTier.points - balance) : 0;

    return (
        <main className="wallet-page">
            <header className="wallet-page-header">
                <p className="admin-eyebrow">Your rewards</p>
                <h1>Green Wallet &amp; Rewards</h1>
                <p>
                    Track your verified Green Points ledger and explore upcoming
                    redemption perks.
                </p>
            </header>

            <section className="wallet-overview" aria-label="Green wallet overview">
                <article className="wallet-summary-card">
                    <span>Available Balance</span>
                    <strong>
                        🪙 {balance.toLocaleString()} <small>pts</small>
                    </strong>
                </article>
                <article className="wallet-summary-card">
                    <span>Verified Carbon Saved</span>
                    <strong>
                        {Number(user?.totalCarbonSaved || 0).toFixed(2)}{" "}
                        <small>kg CO₂</small>
                    </strong>
                </article>
                <article className="wallet-summary-card">
                    <span>Total Reward Entries</span>
                    <strong>{transactions.length}</strong>
                </article>
            </section>

            <section className="wallet-tier-card">
                <div className="wallet-tier-heading">
                    <div>
                        <p className="wallet-section-eyebrow">Next milestone</p>
                        <h2>
                            {nextTier
                                ? nextTier.name
                                : "All listed milestones reached"}
                        </h2>
                    </div>
                    {nextTier && (
                        <span className="wallet-tier-points">
                            {pointsAway.toLocaleString()} pts to go
                        </span>
                    )}
                </div>
                <div
                    className="wallet-progress-track"
                    role="progressbar"
                    aria-label="Progress to next reward tier"
                    aria-valuemin="0"
                    aria-valuemax={nextTier?.points || 2500}
                    aria-valuenow={Math.min(balance, nextTier?.points || 2500)}
                >
                    <span style={{ width: `${tierProgress}%` }} />
                </div>
                <p className="wallet-tier-caption">
                    {nextTier
                        ? `${balance.toLocaleString()} / ${nextTier.points.toLocaleString()} pts — ${pointsAway.toLocaleString()} pts away from the ${nextTier.name} tier`
                        : `${balance.toLocaleString()} pts — you've reached the highest listed reward milestone.`}
                </p>
            </section>

            <section className="wallet-rewards-section">
                <div className="wallet-section-heading">
                    <div>
                        <p className="wallet-section-eyebrow">
                            Partner ecosystem • Coming Soon
                        </p>
                        <h2>Ways to Use Green Points</h2>
                    </div>
                </div>
                <div className="wallet-rewards-grid">
                    {rewardOptions.map((reward) => (
                        <article
                            className="wallet-reward-card"
                            key={reward.title}
                        >
                            <div className="wallet-reward-top">
                                <span className="wallet-reward-icon" aria-hidden="true">
                                    ✦
                                </span>
                                <span className="wallet-coming-soon">
                                    Coming Soon
                                </span>
                            </div>
                            <h3>{reward.title}</h3>
                            <span className="wallet-required-points">
                                🪙 {reward.points.toLocaleString()} pts
                            </span>
                            <p>{reward.description}</p>
                            <button type="button" disabled>
                                Redeem (Coming Soon)
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="wallet-ledger-section">
                <div className="wallet-section-heading">
                    <div>
                        <p className="wallet-section-eyebrow">Live from your account</p>
                        <h2>Wallet Transaction Ledger</h2>
                    </div>
                    {!isLoading && !error && (
                        <span className="wallet-ledger-count">
                            {transactions.length}{" "}
                            {transactions.length === 1
                                ? "entry"
                                : "entries"}
                        </span>
                    )}
                </div>

                {isLoading && (
                    <div className="wallet-ledger-state">
                        Loading wallet transactions...
                    </div>
                )}
                {error && (
                    <p className="wallet-ledger-error" role="alert">
                        {error}
                    </p>
                )}
                {!isLoading && !error && transactions.length === 0 && (
                    <div className="wallet-ledger-state">
                        No wallet transactions yet. Approved activities will
                        appear here.
                    </div>
                )}
                {!isLoading && !error && transactions.length > 0 && (
                    <div className="wallet-ledger-table-wrap">
                        <table className="wallet-ledger-table">
                            <thead>
                                <tr>
                                    <th scope="col">Date &amp; Time</th>
                                    <th scope="col">Activity / Description</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => {
                                    const points = Number(
                                        transaction.points || 0,
                                    );
                                    const typeLabel = formatTransactionType(
                                        transaction.transactionType,
                                    );

                                    return (
                                        <tr key={transaction._id}>
                                            <td data-label="Date & Time">
                                                {formatTransactionDate(
                                                    transaction.createdAt,
                                                )}
                                            </td>
                                            <td
                                                className="wallet-ledger-description"
                                                data-label="Activity / Description"
                                            >
                                                {transaction.activityId
                                                    ?.description ||
                                                    transaction.description ||
                                                    "Wallet transaction"}
                                            </td>
                                            <td data-label="Type">
                                                <span
                                                    className={`wallet-transaction-type ${transaction.transactionType === "Activity_REWARD" ? "is-reward" : transaction.transactionType === "ADMIN_ADJUSTMENT" ? "is-adjustment" : ""}`}
                                                >
                                                    {typeLabel}
                                                </span>
                                            </td>
                                            <td
                                                className={
                                                    points > 0
                                                        ? "wallet-ledger-points is-positive"
                                                        : "wallet-ledger-points"
                                                }
                                                data-label="Points"
                                            >
                                                {points > 0 ? "+" : ""}
                                                {points.toLocaleString()} pts
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Wallet;
