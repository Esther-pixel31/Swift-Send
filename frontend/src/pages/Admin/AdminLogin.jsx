import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminLogin } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  const result = await dispatch(adminLogin({ email, password }));

  if (result.meta.requestStatus === 'fulfilled') {
    const token = result.payload.access_token;
    const decoded = jwtDecode(token);
    const role = decoded?.role;

    if (role === 'admin') {
      toast.success('Login successful');
      navigate('/admin/dashboard');
    } else {
      toast.error('Access denied: Not an admin');
    }
  } else {
    toast.error(result.payload?.msg || 'Login failed');
  }

  setSubmitting(false);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full space-y-6">
        <h2 className="text-2xl font-semibold text-center">Admin Login</h2>
        <p className="text-sm text-center text-textGray mb-4">
          Enter your admin credentials to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="input"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn w-full"
            disabled={submitting}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
