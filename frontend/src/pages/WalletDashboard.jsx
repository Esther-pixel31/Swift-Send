import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import axios from '../utils/axiosInstance';
import { DollarSign, Eye, EyeOff, ClipboardCopy, Banknote, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import SetLimitModal from '../components/SetLimitModal';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const actionCards = [
  { label: 'Deposit', icon: Banknote, bg: 'bg-green-100', color: 'text-green-600', action: 'deposit' },
  { label: 'Withdraw', icon: DollarSign, bg: 'bg-red-100', color: 'text-red-600', action: 'withdraw' },
  { label: 'Set Limits', icon: Settings, bg: 'bg-yellow-100', color: 'text-yellow-600', action: 'limits' },
];

export default function WalletDashboard() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [showDetails, setShowDetails] = useState(false);
  const [wallet, setWallet] = useState({ balance: 0, currency: 'KES' });
  const [txns, setTxns] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);

  const [loadingTxns, setLoadingTxns] = useState(true);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  let userName = 'User';
  let cardNumber = '0000123456780000';
  let cardExpiry = '00/00';
  let cardCVC = '000';

  try {
    if (accessToken && typeof accessToken === 'string') {
      const decoded = jwtDecode(accessToken);
      userName = decoded?.name || 'User';
      cardNumber = decoded?.card_number || cardNumber;
      cardExpiry = decoded?.card_expiry || cardExpiry;
      cardCVC = decoded?.card_cvc || cardCVC;
    }
  } catch (err) {
    console.warn('Failed to decode token', err);
  }

  const fetchWallet = async () => {
    try {
      const res = await axios.get('/wallet');
      setWallet(res.data);
    } catch (err) {
      console.error('Failed to fetch wallet info:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTxns(true);
      const res = await axios.get('/history/my-transactions');
      setTxns(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch recent transactions:', err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      setLoadingBeneficiaries(true);
      const res = await axios.get('/beneficiaries');
      setBeneficiaries(res.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch beneficiaries:', err);
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchBeneficiaries();
  }, []);

  const handleActionClick = (action) => {
    if (action === 'deposit') setShowDepositModal(true);
    if (action === 'withdraw') setShowWithdrawModal(true);
    if (action === 'limits') setShowLimitModal(true);
  };

  const copyAllToClipboard = () => {
    const details = `
Cardholder: ${userName}
Card Number: ${cardNumber}
Expiry: ${cardExpiry}
CVC: ${cardCVC}
Balance: ${wallet?.currency} ${wallet?.balance?.toFixed(2)}
    `.trim();
    navigator.clipboard.writeText(details);
    toast.success("Card details copied");
  };

  const user = useSelector((state) => state.auth.user);
  if (user?.role !== 'user') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-semibold">Hi, {userName} 👋</h2>

      {/* Wallet Card */}
      <motion.div
        layout
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-4 w-80 shadow-lg h-40 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs opacity-70">Cardholder</p>
            <h3 className="text-sm font-semibold">{userName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDetails(!showDetails)} className="text-white hover:text-gray-200">
              {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button onClick={copyAllToClipboard} className="text-white hover:text-gray-200">
              <ClipboardCopy size={16} />
            </button>
          </div>
        </div>

        <div className="font-mono text-lg tracking-widest text-center">
          {showDetails ? cardNumber.match(/.{1,4}/g)?.join(' ') : '**** **** **** ****'}
        </div>

        <div className="flex justify-between text-xs mt-1">
          <div>
            <p className="opacity-60">Valid Thru</p>
            <p>{showDetails ? cardExpiry : '**/**'}</p>
          </div>
          <div>
            <p className="opacity-60">CVC</p>
            <p>{showDetails ? cardCVC : '•••'}</p>
          </div>
          <div>
            <p className="opacity-60">Balance</p>
            <p className="font-semibold">
              {showDetails ? `${wallet?.currency} ${wallet?.balance?.toFixed(2)}` : '****'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {actionCards.map(({ label, icon: Icon, bg, color, action }) => (
            <motion.div
              key={label}
              onClick={() => handleActionClick(action)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition flex flex-col items-start gap-3 ${bg}`}
            >
              <div className={`p-2 rounded-full ${color} bg-white`}>
                <Icon size={20} />
              </div>
              <span className={`text-base font-medium ${color}`}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transaction + Beneficiary Panels */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold mb-2">Recent Transactions</h4>
          {loadingTxns ? (
            <SkeletonLoader count={5} />
          ) : txns.length === 0 ? (
            <p className="text-sm text-gray-500">No transactions yet.</p>
          ) : (
            <ul className="space-y-2">
              {txns.map((tx) => (
                <li key={tx.id} className="flex justify-between text-sm border-b pb-1">
                  <span>{tx.transaction_type}</span>
                  <span>{tx.amount} {tx.currency}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold mb-2">Your Beneficiaries</h4>
          {loadingBeneficiaries ? (
            <SkeletonLoader count={3} />
          ) : beneficiaries.length === 0 ? (
            <p className="text-sm text-gray-500">No beneficiaries added.</p>
          ) : (
            <ul className="space-y-2">
              {beneficiaries.map((b, i) => (
                <li key={i} className="flex justify-between text-sm border-b pb-1">
                  <span>{b.name}</span>
                  <span>{b.account_number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal onClose={() => setShowDepositModal(false)} fetchWallet={fetchWallet} />
        )}
        {showWithdrawModal && (
          <WithdrawModal onClose={() => setShowWithdrawModal(false)} fetchWallet={fetchWallet} />
        )}
        {showLimitModal && (
          <SetLimitModal
            isOpen={showLimitModal}
            onClose={() => setShowLimitModal(false)}
            onSuccess={fetchWallet}
            currentLimits={wallet}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple SkeletonLoader
function SkeletonLoader({ count = 5 }) {
  return (
    <ul className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-4 bg-gray-200 rounded w-full"></li>
      ))}
    </ul>
  );
}
