import { Search, Bell, List } from 'lucide-react';
import { FaArrowRightToBracket } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { CgProfile } from 'react-icons/cg';
import ProductLogo from '../../../public/images/quickfly-horizontal.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { resetFlightSearch } from '../../store/slices/flightSearchSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { notifications } = useNotification();

  // Calculate unread notifications
  const unreadCount = notifications.filter((notif) => !notif.is_read).length;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  const isOtpRoute =
    location.pathname === '/otp' || location.pathname === '/otp-password';
  const isOrderHistoryRoute = location.pathname === '/orderhistory';

  const handleLogoClick = () => {
    dispatch(resetFlightSearch());
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleNotificationClick = () => {
    navigate('/notification');
  };

  const handleProfileClick = () => {
    if (user?.id) {
      navigate(`/account/${user.id}`);
    } else {
      navigate('/account');
    }
  };

  const handleOrderHistoryClick = () => {
    navigate('/orderhistory');
  };

  return (
    <nav className="sticky top-0 left-0 right-0 bg-white shadow-[0px_2px_10px_rgba(0,0,0,0.1)] overflow-x-hidden z-[40] py-2">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="text-[#7126B5] font-bold text-xl flex items-center pl-2 sm:pl-4 md:pl-8">
              <img
                src={ProductLogo}
                alt="QuickFly Logo"
                onClick={handleLogoClick}
                className="cursor-pointer w-[150px]"
              />
            </div>

            {!isOtpRoute && !isOrderHistoryRoute && (
              <div className="hidden md:block relative w-[300px] lg:w-[450px]">
                <input
                  type="text"
                  placeholder="Cari di sini ..."
                  className="w-full bg-gray-100 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7126B5]"
                />
                <Search
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={20}
                />
              </div>
            )}
          </div>

          <div className="pr-2 sm:pr-4 md:pr-8 flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <List
                  className="text-gray-600 cursor-pointer hover:text-[#7126B5] transition-colors"
                  size={28}
                  onClick={handleOrderHistoryClick}
                  title="Order History"
                />
                <div className="relative">
                  <Bell
                    className="text-gray-600 cursor-pointer hover:text-[#7126B5] transition-colors"
                    size={24}
                    onClick={handleNotificationClick}
                    title="Notifications"
                  />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-[#7126B5] text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {displayCount}
                    </div>
                  )}
                </div>
                <CgProfile
                  className="text-gray-600 cursor-pointer hover:text-[#7126B5] transition-colors"
                  size={24}
                  onClick={handleProfileClick}
                  title="Profile"
                />
              </>
            ) : (
              !isOtpRoute && (
                <button
                  onClick={handleLoginClick}
                  className="bg-[#7126B5] text-white px-4 md:px-6 py-2 rounded-lg flex items-center text-sm md:text-base hover:bg-[#8d35db] transition-colors"
                >
                  <FaArrowRightToBracket className="mr-2" size={16} />
                  Masuk
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
