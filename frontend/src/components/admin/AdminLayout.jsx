import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  LayoutDashboard, Users, ShieldCheck, LifeBuoy,
  Banknote, DollarSign, FileText, LogOut
} from 'lucide-react';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      dispatch(logout());
      navigate('/admin/login');
    }
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
    { to: '/admin/support', label: 'Support', icon: LifeBuoy },
    { to: '/admin/wallets', label: 'Wallets', icon: Banknote },
    { to: '/admin/fx-rates', label: 'FX Rates', icon: DollarSign },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bgLight text-textDark">
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden p-2 fixed top-4 left-4 z-50 bg-white border rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex md:flex-col md:justify-between p-6`}
      >
        <div>
          <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md font-medium transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-textGray hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)} // close on mobile click
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t pt-4 text-sm">
          <p className="text-textGray">Logged in as</p>
          <p className="font-medium truncate max-w-[160px]">
            {user?.email || 'Unknown user'}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 flex gap-2 items-center text-red-500 hover:text-red-600 transition px-2 py-1"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen">
  {/* Top bar */}
  <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-white sticky top-0 z-10">
    <h1 className="text-lg font-semibold"></h1>
    <div className="text-sm text-gray-600">
      {user?.email}
    </div>
  </div>

  

        <Outlet />
      </main>
    </div>
  );
}
