
import BeneficiaryCard from '../components/BeneficiaryCard';

export default function Beneficiaries() {
  const beneficiaries = [
    { id: 1, name: 'Pixelpioneers', phone: '+254712345678' },
    { id: 2, name: 'Watu Wengi', phone: '+254798765432' },
    { id: 3, name: 'CodeMasters', phone: '+254701112233' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Beneficiaries</h2>
      <div className="space-y-4">
        {beneficiaries.map((b) => (
          <BeneficiaryCard key={b.id} name={b.name} phone={b.phone} />
        ))}
      </div>
    </div>
  );
}
