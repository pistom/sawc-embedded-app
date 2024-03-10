export default function PageTitle({ title }: { title: string }) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-3xl font-bold tracking-tight text-gray-900 flex">
          <span id="backBtn" className="flex-none"></span><span className="flex-1">{title}</span><span id="afterTitle"></span>
        </div>
      </div>
    </header>
  );
}