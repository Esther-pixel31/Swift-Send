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
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const token = accessToken || localStorage.getItem("accessToken");
  const navigate = useNavigate();
  const isDirty = useRef(false);

  // Warn if user tries to leave with unsaved changes
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
        setInitialData({ name, email, phone_number });
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name || !formData.email || !formData.phone_number) {
      toast.warn("All fields are required.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.warn("Please enter a valid email address.");
      return;
    }

    if (!/^\d{7,15}$/.test(formData.phone_number)) {
      toast.warn("Please enter a valid phone number (7–15 digits).");
      return;
    }

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
    if (isDirty.current) {
      const confirmed = window.confirm("You have unsaved changes. Leave anyway?");
      if (!confirmed) return;
    }
    navigate("/profile");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
        <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} />

        <div className="flex justify-between pt-4 border-t mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 text-white rounded ${submitting ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1"
      />
    </div>
  );
}
