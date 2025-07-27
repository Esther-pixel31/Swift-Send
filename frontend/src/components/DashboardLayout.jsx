import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Menu, Bell, LogOut, Wallet, Users, Send, FileText, LifeBuoy } from 'lucide-react';
import { Link } from "react-router-dom";




export default function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);
  const avatarSeed = encodeURIComponent(user?.name || user?.email || "user");
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  let userEmail = '';
  try {
    const decoded = accessToken ? JSON.parse(atob(accessToken.split('.')[1])) : {};
    userEmail = decoded?.email || '';
  } catch {}

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-bgLight text-textDark">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
        <div>
          <div className="text-2xl font-bold mb-10">Cashie Transfer</div>
          <nav className="space-y-4">
            <NavLink to="/dashboard" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
              }`}>
              <Wallet size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/wallet" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
              }`}>
              <Wallet size={18} />
              <span>Wallet</span>
            </NavLink>
            <NavLink to="/beneficiaries" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
              }`}>
              <Users size={18} />
              <span>Beneficiaries</span>
            </NavLink>
            <NavLink to="/transfer" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
              }`}>
              <Send size={18} />
              <span>Transfer</span>
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
              }`}>
              <FileText size={18} />
              <span>Transactions</span>
            </NavLink>
            <NavLink to="/support" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
              }`}>
              <LifeBuoy size={18} />
              <span>Support</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer / User */}
        <div className="border-t pt-4 mt-6">
          <p className="text-sm text-textGray">Logged in as</p>
          <p className="text-sm font-medium text-textDark truncate">{userEmail}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-3 text-sm text-red-500 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <div className="flex items-center gap-4">
            <button className="text-textGray hover:text-primary">
              <Bell size={20} />
            </button>

            {/* Make avatar clickable */}
            <Link to="/profile">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-8 h-8 rounded-full border shadow cursor-pointer hover:ring-2 ring-primary transition"
        />
      </Link>

          </div>
        </header>

        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
