export function PaginationBar({
  label,
  currentPage,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">{label}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPrevious}
          className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Previous
        </button>

        <span className="px-2 text-sm text-gray-500">Page {currentPage}</span>

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}
