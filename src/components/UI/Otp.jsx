import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Elements/Buttons/Button';
import backIcon from '../../../public/icons/fi_arrow-left-black.svg';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useRegister from '../../hooks/useRegister';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const Otp = () => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { handleOtp, handleResendOtp } = useRegister();
  const loading = useSelector((state) => state.register.loading);
  const email = Cookies.get('email');

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const expiryTime = localStorage.getItem('otpExpiryTime');
    if (expiryTime) {
      const remainingTime = Math.max(
        0,
        Math.floor((expiryTime - Date.now()) / 1000)
      );
      setTimeLeft(remainingTime);
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
    try {
      await handleResendOtp();
      const newExpiryTime = Date.now() + 60000;
      localStorage.setItem('otpExpiryTime', newExpiryTime);
      setTimeLeft(60);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Gagal mengirim ulang OTP');
    }
  };

  return (
    <div className="flex flex-col items-center h-screen bg-white">
      <div className="p-6 rounded-lg w-1/2">
        <Link to="/register">
          <img src={backIcon} alt="Back" className="cursor-pointer" />
        </Link>

        <div className="mx-[10%] mt-[24px]">
          <h2 className="text-[24px] font-bold mb-[40px]">Masukkan OTP</h2>

          <div className="flex gap-1 justify-center mb-[44px]">
            <p>Ketik 6 digit kode yang dikirimkan ke </p>
            <p className="font-bold">{email}</p>
          </div>

          <div className="flex justify-center gap-4 mb-[24px]">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                maxLength="1"
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            ))}
          </div>

          <div className="text-center mb-[105px]">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-500">
                Kirim Ulang OTP dalam{' '}
                <span className="font-bold">{timeLeft} detik</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-red-500 font-bold hover:underline"
                disabled={loading}
              >
                Kirim Ulang
              </button>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-[16px] h-[48px] w-full"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Memverifikasi...' : 'Simpan'}
          </Button>

          {errorMessage && (
            <div className="absolute bottom-[5%] left-0 w-full flex justify-center">
              <p className="w-[273px] h-[52px] bg-red-500 text-white flex items-center justify-center py-2 rounded-[12px]">
                {errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Otp;
