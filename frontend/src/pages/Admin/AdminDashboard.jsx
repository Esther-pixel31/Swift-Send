import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must log in first.");
        return;
      }

      try {
        const res = await fetch("/api/admin/dashboard/metrics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setMetrics(data);
        } else {
          setError(data.msg || "Failed to fetch metrics");
          if (res.status === 403) {
            // Unauthorized, redirect to login
            window.location.href = "/admin/login";
          }
        }
      } catch {
        setError("Network error");
      }
    };

    fetchMetrics();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!metrics) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <ul>
        <li>Total Users: {metrics.total_users}</li>
        <li>Verified Users: {metrics.verified_users}</li>
        <li>Total Wallet Balance: ${metrics.total_wallet_balance.toFixed(2)}</li>
        <li>Monthly Transfers: {metrics.monthly_transfers}</li>
      </ul>
    </div>
  );
}
