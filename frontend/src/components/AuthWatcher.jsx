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

  const publicRoutes = ['/login', '/register', '/verify-otp'];

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

    // 🔐 Redirect to OTP page if not verified
    try {
      const decoded = jwtDecode(accessToken);
      const { otp_verified, exp } = decoded;

      if (!otp_verified && location.pathname !== '/verify-otp') {
        navigate('/verify-otp');
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
