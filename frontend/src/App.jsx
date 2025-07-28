import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthWatcher from './components/AuthWatcher';
import DashboardLayout from './components/DashboardLayout';

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

// 🔐 Admin routes
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminKYC from './pages/Admin/AdminKYC';
import { useSelector } from 'react-redux';

export default function App() {
  const user = useSelector((state) => state.auth.user);
  return (
    <Router>
      <AuthWatcher />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />

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
        </Route>


        {/* Admin Routes */}
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="kyc" element={<AdminKYC />} />

          {/* Add more admin routes here */}
        </Route>

        
      </Routes>

      <ToastContainer position="top-center" autoClose={4000} />
    </Router>
  );
}
