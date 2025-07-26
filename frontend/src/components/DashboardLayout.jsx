import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, Bell } from 'lucide-react';

export default function DashboardLayout() {
  const { accessToken } = useSelector((state) => state.auth);

  let userEmail = '';
  try {
    const decoded = accessToken ? JSON.parse(atob(accessToken.split('.')[1])) : {};
    userEmail = decoded?.email || '';
  } catch {}

  return (
    <div className="min-h-screen flex bg-bgLight text-textDark">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
        <div>
          <div className="text-2xl font-bold mb-10">Cashie Transfer </div>
          <nav className="space-y-4">
            <NavLink
              to="/wallet"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md font-medium ${
                  isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
                }`
              }
            >
              Wallet
            </NavLink>
            <NavLink
              to="/beneficiaries"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md font-medium ${
                  isActive ? 'bg-primary text-white' : 'text-textGray hover:bg-gray-100'
                }`
              }
            >
              Beneficiaries
            </NavLink>
          </nav>
        </div>

        {/* Footer / User */}
        <div className="border-t pt-4 mt-6">
          <p className="text-sm text-textGray">Logged in as</p>
          <p className="text-sm font-medium text-textDark truncate">{userEmail}</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <div className="flex items-center gap-4">
            <button className="text-textGray hover:text-primary">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
