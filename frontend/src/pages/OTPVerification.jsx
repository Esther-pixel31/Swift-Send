// src/pages/OTPVerification.jsx

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from '../utils/axiosInstance';
import { setAuthFromStorage } from '../features/auth/authSlice';

export default function OTPVerification() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [timer, setTimer] = useState(15 * 60); // 15 minutes
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  // Redirect if no token
  useEffect(() => {
    if (!accessToken) navigate('/login');
  }, [accessToken, navigate]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
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

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pasted)) {
      setCode(pasted.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('loading');
    const fullCode = code.join('');

    if (timer === 0) {
      setError('OTP expired. Please request a new one.');
      setStatus('idle');
      return;
    }

    try {
      const res = await axios.post(
        '/auth/verify-otp',
        { code: fullCode },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.status === 200) {
        localStorage.setItem('accessToken', res.data.access_token);
        localStorage.setItem('refreshToken', res.data.refresh_token);

        dispatch(
          setAuthFromStorage({
            accessToken: res.data.access_token,
            refreshToken: res.data.refresh_token,
          })
        );

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
      await axios.post(
        '/auth/generate-otp',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setTimer(15 * 60);
      setResendCooldown(30);
      setError(null);
    } catch {
      setError('Failed to resend OTP.');
    }
  };

  const isIncomplete = code.some((digit) => digit === '');

  let email = '';
  try {
    const decoded = jwtDecode(accessToken);
    email = decoded?.email || '';
  } catch {}

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-cardBg p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-textDark mb-2">
          OTP Verification
        </h1>
        <p className="text-base text-textGray text-center mb-2">
          Enter the 6-digit code sent to your device
        </p>
        {email && (
          <p className="text-sm text-textGray text-center mb-2">
            Code sent to:{' '}
            <span className="text-textDark font-medium">{email}</span>
          </p>
        )}
        <p className="text-sm text-textGray text-center mb-6">
          Expires in: {formatTime(timer)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset
            className="flex justify-center gap-3"
            aria-label="OTP Code Input"
          >
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                ref={(el) => (inputsRef.current[idx] = el)}
                className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </fieldset>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

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
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend OTP'}
          </button>
        </p>
      </div>
    </div>
  );
}
