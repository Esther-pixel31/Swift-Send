// src/pages/ChangePassword.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const token = accessToken || localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (password.length >= 8 && /(?=.*[A-Z])(?=.*\d)/.test(password)) return "Strong";
    return "Medium";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      toast.error("All fields are required.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    if (!validatePassword(formData.new_password)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
      return;
    }

    setIsSubmitting(true);
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
      toast.success("Password changed successfully.");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      toast.error("Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="Current Password"
          name="current_password"
          value={formData.current_password}
          onChange={handleChange}
          show={showPassword}
          toggle={toggleVisibility}
        />
        <PasswordInput
          label="New Password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          show={showPassword}
          toggle={toggleVisibility}
        />
        {formData.new_password && (
          <p className="text-sm text-gray-600">
            Strength:{" "}
            <span className={
              getPasswordStrength(formData.new_password) === "Strong"
                ? "text-green-600"
                : getPasswordStrength(formData.new_password) === "Medium"
                ? "text-yellow-600"
                : "text-red-600"
            }>
              {getPasswordStrength(formData.new_password)}
            </span>
          </p>
        )}
        <PasswordInput
          label="Confirm New Password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          show={showPassword}
          toggle={toggleVisibility}
        />

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded ${isSubmitting ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}



function PasswordInput({ label, name, value, onChange, show, toggle }) {
  return (
    <div className="relative">
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 pr-10"
      />
      <span
        onClick={toggle}
        className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
      >
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </span>
    </div>
  );
}

