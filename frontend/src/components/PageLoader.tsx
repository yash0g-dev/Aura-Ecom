export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900">
      <h1 className="mb-4 text-3xl font-bold text-white">Nexus</h1>

      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-white" />
    </div>
  );
};
