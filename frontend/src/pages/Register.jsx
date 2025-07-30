

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice'; // Adjust path based on your file structure
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Assuming you want toast notifications here too

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Matching Login.jsx's showPassword state
  const [loading, setLoading] = useState(false); // Matching Login.jsx's local loading state

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth); // Accessing error from auth slice

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true when form is submitted

    // Client-side password confirmation check
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.'); // Using toast for user feedback
      setLoading(false); // Stop loading if client-side validation fails
      return;
    }

    const result = await dispatch(register({ email, password })); // Dispatch register async thunk

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(result.payload?.msg || 'Registration successful! Please log in.'); // Success message
      navigate('/login'); // Navigate to login page after successful registration
    } else {
      // Error is handled by extraReducers in authSlice.js, we just display it here
      toast.error(result.payload?.msg || 'Registration failed. Please try again.');
    }

    setLoading(false); // Stop loading after API call
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-cardBg p-10 rounded-3xl shadow-xl mx-auto max-w-md w-full">
        <h1 className="text-3xl font-semibold text-center text-textDark mb-2">Create Your Account</h1>
        <p className="text-base text-textGray text-center mb-8">Sign up to get started with Cashie</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-textGray mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-textGray mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-accent cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-textGray mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-accent cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>

          {/* Display error message from Redux state if available and not handled by toast */}
          {error && error?.type === 'register' && (
            <p className="text-sm text-red-500 text-center">{error.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-md transition ${
              loading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-accent'
            }`}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-textGray text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}