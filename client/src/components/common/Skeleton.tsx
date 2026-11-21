import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export default function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <span
      className={cn('skeleton', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
