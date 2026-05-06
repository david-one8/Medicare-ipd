import { Skeleton } from 'boneyard-js/react';

function SkeletonBlock({ className }) {
  return <div className={`rounded bg-gray-200 ${className}`} />;
}

export function TableSkeleton({ name, columns = 6, rows = 6 }) {
  const headerCells = Array.from({ length: columns });
  const bodyRows = Array.from({ length: rows });

  const fixture = (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headerCells.map((_, index) => (
              <th key={index} className="px-4 py-3">
                <SkeletonBlock className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100">
              {headerCells.map((__, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  <SkeletonBlock
                    className={
                      cellIndex === 0
                        ? 'h-4 w-8'
                        : cellIndex === columns - 1
                        ? 'h-8 w-28'
                        : 'h-4 w-24'
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Skeleton
      name={name}
      loading
      animate="shimmer"
      transition
      fixture={fixture}
      fallback={fixture}
      snapshotConfig={{ leafTags: ['div', 'th', 'td'] }}
    >
      {fixture}
    </Skeleton>
  );
}

export function FormSkeleton({ name, fields = 4 }) {
  const fieldRows = Array.from({ length: fields });

  const fixture = (
    <div className="mx-auto mt-2 max-w-2xl rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-4 sm:p-6">
      <SkeletonBlock className="h-4 w-28 mb-4" />
      <SkeletonBlock className="h-8 w-44 mb-6" />
      <div className="space-y-5">
        {fieldRows.map((_, index) => (
          <div key={index}>
            <SkeletonBlock className="h-4 w-32 mb-2" />
            <SkeletonBlock className={index === 1 ? 'h-20 w-full' : 'h-10 w-full'} />
          </div>
        ))}
        <SkeletonBlock className="h-10 w-32" />
      </div>
    </div>
  );

  return (
    <Skeleton
      name={name}
      loading
      animate="shimmer"
      transition
      fixture={fixture}
      fallback={fixture}
      snapshotConfig={{ leafTags: ['div'] }}
    >
      {fixture}
    </Skeleton>
  );
}
