import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register({ name, email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-cardBg p-10 rounded-3xl shadow-xl mx-auto max-w-md w-full">
        <h1 className="text-3xl font-semibold text-center text-textDark mb-2">
          Welcome
        </h1>
        <p className="text-base text-textGray text-center mb-8">
          Hello there, create new account
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-textGray mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="
                w-full px-4 py-3 rounded-md border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-accent
              "
              required
            />
          </div>

          <div>
            <label className="block text-sm text-textGray mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="
                w-full px-4 py-3 rounded-md border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-accent
              "
              required
            />
          </div>

          <div>
            <label className="block text-sm text-textGray mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="
                w-full px-4 py-3 rounded-md border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-accent
              "
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <p className="text-xs text-textGray">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary underline">
              Terms and Conditions
            </a>.
          </p>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-accent transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-textGray text-center mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
