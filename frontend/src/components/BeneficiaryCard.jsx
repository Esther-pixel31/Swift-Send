
export default function BeneficiaryCard({ name, phone }) {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">Phone: {phone}</p>
    </div>
  );
}
