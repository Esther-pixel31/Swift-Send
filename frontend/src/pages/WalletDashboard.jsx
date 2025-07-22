
import DashboardCard from '../components/DashboardCard';

export default function WalletDashboard() {
  const cards = [
    { id: 1, title: 'Balance', content: 'KES 10,000' },
    { id: 2, title: 'Recent Transactions', content: '3 completed' },
    { id: 3, title: 'Pending Transfers', content: '1 transfer pending' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Wallet Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <DashboardCard
            key={card.id}
            title={card.title}
            content={card.content}
          />
        ))}
      </div>
    </div>
  );
}
