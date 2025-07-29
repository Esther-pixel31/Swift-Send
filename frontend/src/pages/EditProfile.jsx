import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const isDirty = useRef(false);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const token = accessToken || localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    const beforeUnload = (e) => {
      if (isDirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email, phone_number } = res.data;
        setFormData({ name, email, phone_number });
      } catch {
        toast.error("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    isDirty.current = true;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required.";
    if (!formData.email.trim()) errs.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = "Invalid email address.";
    if (!formData.phone_number.trim()) errs.phone_number = "Phone number is required.";
    else if (!/^\d{7,15}$/.test(formData.phone_number)) errs.phone_number = "Phone number must be 7–15 digits.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await axios.put("/user/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully.");
      isDirty.current = false;
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty.current && !window.confirm("You have unsaved changes. Leave anyway?")) return;
    navigate("/profile");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={submitting}
        />
        <Input
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={submitting}
        />
        <Input
          label="Phone Number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          error={errors.phone_number}
          disabled={submitting}
        />

        <div className="flex justify-between pt-4 border-t mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 text-white rounded ${
              submitting ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, error, disabled }) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-gray-700 mb-1 font-medium">
        {label}
      </label>
      <input
        id={name}
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
