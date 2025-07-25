// src/pages/OTPVerification.jsx
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

export default function OTPVerification() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [timer, setTimer] = useState(15 * 60); // 15 minutes in seconds
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);

  // ⏱ Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 🔐 Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('loading');
    const fullCode = code.join('');
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
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired OTP');
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  // 🔁 Resend OTP
  const resendOTP = async () => {
    try {
      await axios.post('/auth/generate-otp', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setTimer(15 * 60); // reset timer
      setError(null);
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  // Handle input digit change
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight px-4">
      <div className="bg-cardBg p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-textDark mb-2">OTP Verification</h1>
        <p className="text-base text-textGray text-center mb-4">
          Enter the 6-digit code sent to your device
        </p>
        <p className="text-sm text-textGray text-center mb-6">Expires in: {formatTime(timer)}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Split Inputs */}
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
            disabled={status === 'loading'}
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-accent transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        {/* Resend */}
        <p className="text-center mt-4 text-sm text-textGray">
          Didn’t receive the code?{' '}
          <button
            type="button"
            onClick={resendOTP}
            disabled={timer > 0}
            className="text-primary hover:underline disabled:opacity-40"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}
