import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Elements/Buttons/Button';
import backIcon from '../../../public/icons/fi_arrow-left-black.svg';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useRegister from '../../hooks/useRegister';
import Cookies from 'js-cookie';

const Otp = () => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [showResendSection, setShowResendSection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();
  const { handleOtp, handleResendOtp } = useRegister();
  const loading = useSelector((state) => state.register.loading);
  const email = Cookies.get('email');

  useEffect(() => {
    if (!email || !Cookies.get('tempPassword')) {
      navigate('/register');
      return;
    }

    const currentTime = Date.now();
    const initialExpiryTime = localStorage.getItem('otpExpiryTime');
    const hasStartedSession = localStorage.getItem('otpSessionStarted');

    if (!hasStartedSession) {
      localStorage.setItem('otpSessionStarted', 'true');
      localStorage.setItem('otpExpiryTime', (currentTime + 60000).toString());
      setTimeLeft(60);
      setCanResend(false);
      setShowResendSection(false);

      const timer = setTimeout(() => {
        setShowResendSection(true);
        setIsInitialLoad(false);
      }, 60000);

      return () => clearTimeout(timer);
    } else {
      setIsInitialLoad(false);
      setShowResendSection(true);

      if (initialExpiryTime) {
        const remainingTime = Math.max(
          0,
          Math.floor((parseInt(initialExpiryTime) - currentTime) / 1000)
        );
        setTimeLeft(remainingTime);
        setCanResend(remainingTime <= 0);
      }
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !isInitialLoad) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            setCanResend(true);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isInitialLoad]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrorMessage('Masukkan 6 digit kode OTP');
      return;
    }

    try {
      setErrorMessage('');
      await handleOtp(otpString);
    } catch (error) {
      setErrorMessage(error.message || 'Kode OTP tidak valid');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await handleResendOtp();
      const newExpiryTime = Date.now() + 60000;
      localStorage.setItem('otpExpiryTime', newExpiryTime.toString());
      setTimeLeft(60);
      setCanResend(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Gagal mengirim ulang OTP');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md relative">
        <Link to="/register">
          <img src={backIcon} alt="Back" className="cursor-pointer mb-6" />
        </Link>

        <h2 className="text-2xl font-bold mb-8">Masukkan OTP</h2>

        <div className="text-center mb-8">
          <p>Ketik 6 digit kode yang dikirimkan ke</p>
          <p className="font-bold mt-1">{email}</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              maxLength="1"
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          ))}
        </div>

        {showResendSection && (
          <div className="text-center mb-8">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-500">
                Kirim Ulang OTP dalam{' '}
                <span className="font-bold">{timeLeft} detik</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className={`text-red-500 font-bold ${
                  canResend
                    ? 'hover:underline'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!canResend || loading}
              >
                Kirim Ulang
              </button>
            )}
          </div>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          className="h-12 w-full"
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi'}
        </Button>

        {errorMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <div className="p-3 text-sm text-white text-center bg-red-500 font-medium rounded-lg shadow-lg">
              {errorMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Otp;
