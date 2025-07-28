import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { logout, setAuthFromStorage } from '../features/auth/authSlice';
import { isTokenExpired } from '../utils/token';

export default function AuthWatcher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);

  const publicRoutes = ['/login', '/register', '/verify-otp', '/admin/login'];

  useEffect(() => {
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');

    // Hydrate Redux from localStorage
    if (!accessToken && storedAccess && !isTokenExpired(storedAccess)) {
      dispatch(setAuthFromStorage({ accessToken: storedAccess, refreshToken: storedRefresh }));
      return;
    }

    // No token or expired
    if (!accessToken || isTokenExpired(accessToken)) {
      dispatch(logout());
      if (!publicRoutes.includes(location.pathname)) {
        toast.info('Session expired. Please log in again.');
        navigate('/login');
      }
      return;
    }

    try {
      const decoded = jwtDecode(accessToken);
      const { otp_verified, exp, role } = decoded;

      // Redirect to OTP verification if required
      if (!otp_verified && location.pathname !== '/verify-otp') {
        navigate('/verify-otp');
        return;
      }

      // ✅ Redirect to role-specific dashboard after login or hydration
      if (['/login', '/register', '/', '/admin/login'].includes(location.pathname)) {
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
        return;
      }

      // Auto logout on expiry
      const delay = exp * 1000 - Date.now();
      const timeoutId = setTimeout(() => {
        dispatch(logout());
        toast.info('Session expired. Please log in again.');
        navigate('/login');
      }, delay);

      return () => clearTimeout(timeoutId);
    } catch {
      dispatch(logout());
      navigate('/login');
    }
  }, [accessToken, refreshToken, dispatch, location.pathname, navigate]);

  return null;
}
