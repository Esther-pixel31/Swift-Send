
export default function StatCard({ title, content }) {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{content}</p>
    </div>
  );
}
