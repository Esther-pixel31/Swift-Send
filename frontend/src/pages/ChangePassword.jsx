// src/pages/ChangePassword.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");

  const accessToken = useSelector((state) => state.auth.accessToken);
  const token = accessToken || localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await axios.post(
        "/user/change-password",
        {
          current_password: formData.current_password,
          new_password: formData.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Password changed successfully.");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMessage("Failed to change password.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput label="Current Password" name="current_password" value={formData.current_password} onChange={handleChange} />
        <PasswordInput label="New Password" name="new_password" value={formData.new_password} onChange={handleChange} />
        <PasswordInput label="Confirm New Password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} />

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Update Password
        </button>
      </form>
    </div>
  );
}

function PasswordInput({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-700">{label}</label>
      <input
        type="password"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1"
      />
    </div>
  );
}
