export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-6 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
