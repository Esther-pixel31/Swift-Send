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

    const { current_password, new_password, confirm_password } = formData;

    if (!current_password || !new_password || !confirm_password) {
      toast.error("All fields are required.");
      return;
    }

    if (new_password !== confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    if (!validatePassword(new_password)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        "/user/change-password",
        { current_password, new_password },
        { headers: { Authorization: `Bearer ${token}` } }
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

  const strength = getPasswordStrength(formData.new_password);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6 text-textDark">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          id="current-password"
          label="Current Password"
          name="current_password"
          value={formData.current_password}
          onChange={handleChange}
          show={showPassword}
          toggle={toggleVisibility}
        />
        <PasswordInput
          id="new-password"
          label="New Password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          show={showPassword}
          toggle={toggleVisibility}
        />
        {formData.new_password && (
          <p className={`text-sm font-medium ${
            strength === "Strong" ? "text-green-600" :
            strength === "Medium" ? "text-yellow-600" : "text-red-600"
          }`}>
            Strength: {strength}
          </p>
        )}
        <PasswordInput
          id="confirm-password"
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
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-textDark rounded-md"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-md ${
              isSubmitting ? "bg-primary/60" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordInput({ id, label, name, value, onChange, show, toggle }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-textDark mb-1">
        {label}
      </label>
      <input
        id={id}
        type={show ? "text" : "password"}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-textDark focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <span
        onClick={toggle}
        className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
      >
        {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </span>
    </div>
  );
}
