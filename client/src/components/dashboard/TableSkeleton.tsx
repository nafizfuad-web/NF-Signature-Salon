import Skeleton from '@/components/common/Skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export default function TableSkeleton({ rows = 4, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="table-skeleton-row" key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              height="13px"
              width={columnIndex === 0 ? '72%' : columnIndex === columns - 1 ? '52%' : '64%'}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
