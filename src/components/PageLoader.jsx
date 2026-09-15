export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center" role="status" aria-label="Loading">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#5A5A40]/20 border-t-[#5A5A40]" />
    </div>
  );
}
