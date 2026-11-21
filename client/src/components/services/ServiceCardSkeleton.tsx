import Skeleton from '@/components/common/Skeleton'

export default function ServiceCardSkeleton() {
  return (
    <div className="service-card service-card-skeleton" aria-hidden="true">
      <Skeleton className="service-card-media-skeleton" />
      <div className="service-card-body">
        <Skeleton width="34%" height="11px" />
        <Skeleton width="72%" height="20px" className="skeleton-gap" />
        <Skeleton width="100%" height="12px" className="skeleton-gap" />
        <Skeleton width="88%" height="12px" />
        <div className="service-card-skeleton-footer">
          <Skeleton width="64px" height="20px" />
          <Skeleton width="72px" height="13px" />
        </div>
      </div>
    </div>
  )
}
