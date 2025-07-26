import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import Register from './pages/Register';
import WalletDashboard from './pages/WalletDashboard';
import Beneficiaries from './pages/Beneficiaries';
import DashboardLayout from './components/DashboardLayout';
import 'react-toastify/dist/ReactToastify.css'
import AuthWatcher from './components/AuthWatcher';
import OTPVerification from './pages/OTPVerification';
import Transactions from './pages/Transactions';
import Transfer from './pages/Transfer';
import Support from './pages/Support';

 export default function App() {
  return (
    <Router>
      <AuthWatcher />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<WalletDashboard />} />
          <Route path="wallet" element={<WalletDashboard />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="transactions" element={<Transactions />} /> 
          <Route path="transfer" element={<Transfer />} />         
          <Route path="support" element={<Support />} />         
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={4000} />
    </Router>
  );
}