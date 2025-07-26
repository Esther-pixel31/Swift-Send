import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from '../utils/axiosInstance';
import { useDispatch } from 'react-redux';
import { setAuthFromStorage } from '../features/auth/authSlice';


export default function OTPVerification() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [timer, setTimer] = useState(15 * 60); // 15 min
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  //  Guard if no token
  useEffect(() => {
    if (!accessToken) navigate('/login');
  }, [accessToken, navigate]);

  // ⏱ Start timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ⏱ Cooldown resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const cooldownInterval = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(cooldownInterval);
    }
  }, [resendCooldown]);

  // Autofocus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('loading');
    const fullCode = code.join('');
    try {
      const res = await axios.post('/auth/verify-otp', { code: fullCode }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === 200) {
        // Store tokens
        localStorage.setItem('accessToken', res.data.access_token);
        localStorage.setItem('refreshToken', res.data.refresh_token);

        // Optional Redux hydration (if you want real-time state update)
        dispatch(setAuthFromStorage({
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token
        }));

        // Redirect to dashboard
        navigate('/dashboard');
        }

    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired OTP');
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  const resendOTP = async () => {
    try {
      await axios.post('/auth/generate-otp', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setTimer(15 * 60);
      setResendCooldown(30); // 30s cooldown
      setError(null);
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const isIncomplete = code.some(d => d === '');

  let email = '';
  try {
    const decoded = jwtDecode(accessToken);
    email = decoded?.email || '';
  } catch {}

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-cardBg p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-textDark mb-2">OTP Verification</h1>
        <p className="text-base text-textGray text-center mb-2">
          Enter the 6-digit code sent to your device
        </p>
        {email && (
          <p className="text-sm text-textGray text-center mb-2">
            Code sent to: <span className="text-textDark font-medium">{email}</span>
          </p>
        )}
        <p className="text-sm text-textGray text-center mb-6">Expires in: {formatTime(timer)}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center gap-3">
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                ref={(el) => (inputsRef.current[idx] = el)}
                className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={status === 'loading' || isIncomplete || timer === 0}
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-accent transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-textGray">
          Didn’t receive the code?{' '}
          <button
            type="button"
            onClick={resendOTP}
            disabled={resendCooldown > 0}
            className="text-primary hover:underline disabled:opacity-40"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </p>
      </div>
    </div>
  );
}
