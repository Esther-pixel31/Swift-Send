import { Outlet, Link } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">SwiftSend</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/wallet" className="hover:bg-gray-700 p-2 rounded">Wallet</Link>
          <Link to="/beneficiaries" className="hover:bg-gray-700 p-2 rounded">Beneficiaries</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
