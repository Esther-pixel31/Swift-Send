// src/pages/Login.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    } else if (result.payload?.msg === 'OTP verification required') {
      navigate('/verify-otp');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-cardBg p-10 rounded-3xl shadow-xl mx-auto max-w-md w-full">
        <h1 className="text-3xl font-semibold text-center text-textDark mb-2">Welcome Back</h1>
        <p className="text-base text-textGray text-center mb-8">Hello there, sign in to continue</p>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <div className="text-right mt-2 text-sm text-accent hover:underline">Forgot your password?</div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" className="w-full py-3 bg-primary text-white rounded-md hover:bg-accent transition">
            Sign In
          </button>
        </form>

        <p className="text-sm text-textGray text-center mt-6">
          Don’t have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
