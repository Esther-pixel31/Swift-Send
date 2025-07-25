import { useState } from 'react';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { maskCardNumber } from '../utils/maskCardNumber';
import {
  CreditCard, Send, DollarSign, Smartphone, Receipt,
  PiggyBank, Wallet, FileText, Users, Home, Eye, EyeOff
} from 'lucide-react';

const actionCards = [
  { label: 'Account and Card', icon: CreditCard, bg: 'bg-blue-100', color: 'text-blue-600' },
  { label: 'Transfer', icon: Send, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  { label: 'Withdraw', icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600' },
  { label: 'Mobile prepaid', icon: Smartphone, bg: 'bg-yellow-100', color: 'text-yellow-600' },
  { label: 'Pay the bill', icon: Receipt, bg: 'bg-red-100', color: 'text-red-600' },
  { label: 'Save online', icon: PiggyBank, bg: 'bg-pink-100', color: 'text-pink-600' },
  { label: 'Credit card', icon: Wallet, bg: 'bg-purple-100', color: 'text-purple-600' },
  { label: 'Transaction report', icon: FileText, bg: 'bg-orange-100', color: 'text-orange-600' },
  { label: 'Beneficiary', icon: Users, bg: 'bg-teal-100', color: 'text-teal-600' },
  { label: 'Home', icon: Home, bg: 'bg-gray-100', color: 'text-gray-600' },
];

export default function WalletDashboard() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [showCVC, setShowCVC] = useState(false);

  let userName = 'User';
  let cardNumber = '0000000000000000';
  let cardExpiry = '00/00';
  let cardCVC = '•••';

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

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <h2 className="text-2xl font-semibold">Hi, {userName}</h2>

      {/* Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 max-w-xl shadow-xl relative">
        <p className="text-sm opacity-80">Cardholder</p>
        <h3 className="text-lg font-semibold">{userName}</h3>

        <div className="mt-6 flex justify-between font-mono text-xl tracking-widest">
          {maskCardNumber(cardNumber).split(' ').map((chunk, idx) => (
            <span key={idx}>{chunk}</span>
          ))}
        </div>

        <div className="mt-6 flex justify-between text-sm items-center">
          <div>
            <p className="opacity-70">Valid Thru</p>
            <p>{cardExpiry}</p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="opacity-70">CVC</p>
              <p className="tracking-wider">{showCVC ? cardCVC : '•••'}</p>
            </div>
            <button onClick={() => setShowCVC(!showCVC)} className="focus:outline-none">
              {showCVC ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {actionCards.map(({ label, icon: Icon, bg, color }) => (
            <div key={label} className={`rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition flex flex-col items-start gap-3 ${bg}`}>
              <div className={`p-2 rounded-full ${color} bg-white`}>
                <Icon size={20} />
              </div>
              <span className={`text-base font-medium ${color}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder Panels */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold mb-2">Recent Transactions</h4>
          <p className="text-sm text-textGray">No transactions yet.</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold mb-2">Your Beneficiaries</h4>
          <p className="text-sm text-textGray">No beneficiaries added.</p>
        </div>
      </div>
    </div>
  );
}
