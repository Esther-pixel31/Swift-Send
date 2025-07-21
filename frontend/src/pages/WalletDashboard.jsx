
export default function WalletDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Wallet Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded">Balance: KES 10,000</div>
        <div className="bg-white shadow p-4 rounded">Recent Transactions</div>
        <div className="bg-white shadow p-4 rounded">Pending Transfers</div>
      </div>
    </div>
  );
}
