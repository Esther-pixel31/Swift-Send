import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    const result = await dispatch(register({ name, email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-zinc-900 px-4">
      <div className="bg-cardBg dark:bg-zinc-800 p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-textDark dark:text-white mb-2">
          Welcome
        </h1>
        <p className="text-base text-textGray dark:text-zinc-400 text-center mb-6">
          Create a new account
        </p>

        

        

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm text-textGray dark:text-zinc-400 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-textGray dark:text-zinc-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="hello@example.com"
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-textGray dark:text-zinc-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3 pr-10 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <p className="text-xs text-textGray dark:text-zinc-400">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary underline hover:text-accent">
              Terms and Conditions
            </a>.
          </p>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-accent transition"
          >
            Sign Up
          </button>
          {/* Social Auth Buttons */}
          <div className="text-sm text-center text-zinc-400 mb-4">or</div>
          
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-600 transition">
            <Mail size={18} />
            Sign up with Google
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-600 transition">
            <Github size={18} />
            Sign up with GitHub
          </button>
        </div>
        </form>

        <p className="text-sm text-textGray dark:text-zinc-400 text-center mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
