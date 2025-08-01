import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useSelector } from 'react-redux';

import AuthWatcher from './components/AuthWatcher';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import WalletDashboard from './pages/WalletDashboard';
import Beneficiaries from './pages/Beneficiaries';
import Transactions from './pages/Transactions';
import Transfer from './pages/Transfer';
import Support from './pages/Support';
import Profile from './pages/Profile';
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import ScheduledTransfers from './pages/ScheduledTransfers';

// 🔐 Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminKYC from './pages/Admin/AdminKYC';
import AdminSupport from './pages/Admin/AdminSupport';
import AdminWallets from './pages/Admin/AdminWallets';
import AdminFxRates from './pages/Admin/AdminFxRates';
import AdminAuditLogs from './pages/Admin/AdminAuditLogs';

export default function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Router>
      <AuthWatcher />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />

        {/* Admin Login (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes with Layout */}
        <Route
          path="/admin"
          element={
            user?.role === 'admin' ? (
              <AdminLayout />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        >
          {/* Redirect /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kyc" element={<AdminKYC />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="wallets" element={<AdminWallets />} />
          <Route path="fx-rates" element={<AdminFxRates />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          
        </Route>

        {/* Authenticated User Routes */}
        <Route
          path="/"
          element={
            user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <DashboardLayout />
            )
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="wallet" element={<WalletDashboard />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="support" element={<Support />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="scheduled-transfers" element={<ScheduledTransfers />} />
        </Route>
      </Routes>

      <ToastContainer position="top-center" autoClose={4000} />
    </Router>
  );
}
