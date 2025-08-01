import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { isTokenExpired } from "../utils/token";
import { logout } from "../features/auth/authSlice";
import KycModal from "../components/KycModal"; // Make sure this path matches your project structure

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycRefreshKey, setKycRefreshKey] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const accessToken = useSelector((state) => state.auth.accessToken);
  const token = accessToken || localStorage.getItem("accessToken");

  useEffect(() => {
    async function fetchUserData() {
      if (!token || isTokenExpired(token)) {
        setErrorMsg("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setErrorMsg("Session expired. Please log in again.");
        } else {
          setErrorMsg("Failed to load profile data.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [token, kycRefreshKey]); // refresh on modal upload

  const handleEdit = () => navigate("/edit-profile");
  const handleChangePassword = () => navigate("/change-password");

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      await axios.delete("/user/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(logout());
      navigate("/register");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete account. Please try again.");
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  if (errorMsg)
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {errorMsg}
        <br />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  if (!user)
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">User not found.</div>
    );

  const avatarSeed = encodeURIComponent(user.name || user.email || "user");
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 max-w-2xl mx-auto mt-6 text-zinc-800 dark:text-zinc-200">
      {/* Avatar */}
      <div className="flex flex-col items-center space-y-3">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border shadow"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>

      <h2 className="text-xl font-semibold text-center">User Profile</h2>

      <ProfileRow label="Name" value={user.name} />
      <ProfileRow label="Email" value={user.email} />
      <ProfileRow label="Phone Number" value={user.phone_number} />
      <ProfileRow label="Role" value={capitalize(user.role)} />
      <ProfileRow label="Verified" value={user.is_verified ? "Yes" : "No"} />

      {/* KYC Status + Button */}
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">KYC Status</span>
          <StatusBadge status={user.kyc_status} />
        </div>
        {user.kyc_status !== "approved" && (
          <button
            onClick={() => setShowKycModal(true)}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Verify Identity
          </button>
        )}
      </div>

      <ProfileRow label="Account Created" value={formatDate(user.created_at)} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit Profile
        </button>
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Change Password
        </button>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>

      {/* KYC Modal */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        onUploadSuccess={() => {
          setKycRefreshKey(Date.now());
        }}
      />
    </div>
  );
}

// -- Utilities --

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const base = "px-2 py-1 text-xs rounded-full font-medium capitalize";
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  const colorClass = styles[status] || styles.unknown;
  return <span className={`${base} ${colorClass}`}>{capitalize(status || "unknown")}</span>;
}

function formatDate(iso) {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
