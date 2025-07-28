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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
    { to: '/admin/support', label: 'Support', icon: LifeBuoy },
    { to: '/admin/wallets', label: 'Wallets', icon: Banknote },
    { to: '/admin/fx', label: 'FX Rates', icon: DollarSign },
    { to: '/admin/logs/audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-bgLight text-textDark">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
        <div>
          <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md font-medium ${
                    isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-6 border-t pt-4 text-sm">
          <p className="text-textGray">Logged in as</p>
          <p className="font-medium truncate">{user?.email}</p>
          <button onClick={handleLogout} className="mt-2 flex gap-2 items-center text-red-500 hover:text-red-600">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
