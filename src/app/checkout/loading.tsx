export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#c1aa92]" />
        <p className="mt-4 text-lg font-semibold text-[#c1aa92]">Carregando...</p>
      </div>
    </div>
  );
}