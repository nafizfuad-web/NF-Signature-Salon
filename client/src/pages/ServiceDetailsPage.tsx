import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import SectionHeader from '@/components/common/SectionHeader'
import Skeleton from '@/components/common/Skeleton'
import ServiceCard from '@/components/services/ServiceCard'
import ServiceCardSkeleton from '@/components/services/ServiceCardSkeleton'
import ServiceImage from '@/components/services/ServiceImage'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import { useService, useServices } from '@/hooks/useServices'
import { useToast } from '@/hooks/useToast'

export default function ServiceDetailsPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data: service, loading, error, errorStatus, refetch } = useService(serviceId)
  const { data: allServices, loading: relatedLoading } = useServices()
  const { toast } = useToast()
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && errorStatus !== 404 && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load this service', error)
    }
  }, [error, errorStatus, toast])

  if (loading) {
    return (
      <>
        <PageHeader
          compact
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Services', to: '/services' },
            { label: 'Service details' },
          ]}
          title="Service details"
        />
        <section className="section-padding" aria-busy="true" aria-label="Loading service details">
          <div className="section-container service-detail-layout">
            <div className="service-detail-main">
              <Skeleton className="detail-visual-skeleton" />
              <div className="detail-copy-skeleton">
                <Skeleton width="38%" height="14px" />
                <Skeleton width="100%" height="12px" className="skeleton-gap" />
                <Skeleton width="92%" height="12px" />
                <Skeleton width="96%" height="12px" />
                <Skeleton width="64%" height="12px" />
              </div>
            </div>
            <aside className="service-detail-aside">
              <Skeleton className="detail-card-skeleton" />
            </aside>
          </div>
        </section>
      </>
    )
  }

  if (error || !service) {
    const notFound = errorStatus === 404 || (!error && !service)
    return (
      <>
        <PageHeader
          compact
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Services', to: '/services' },
            { label: notFound ? 'Not found' : 'Service details' },
          ]}
          title={notFound ? 'Service not found' : 'Service details'}
        />
        <section className="section-padding">
          <div className="section-container">
            {notFound ? (
              <EmptyState
                icon="search"
                title="We couldn't find that service"
                description="It may have been renamed or removed from the menu. Browse the full service list to find something similar."
                action={<ButtonLink to="/services" variant="outline">Browse all services</ButtonLink>}
              />
            ) : (
              <ErrorState
                title="We couldn't load this service"
                message={error ?? 'Please try again.'}
                onRetry={refetch}
              />
            )}
          </div>
        </section>
      </>
    )
  }

  const category = CATEGORY_META[service.category]
  const related = (allServices ?? [])
    .filter((item) => item.category === service.category && item.id !== service.id)
    .slice(0, 3)

  return (
    <>
      <PageHeader
        compact
        eyebrow={category.label}
        title={service.title}
        subtitle={service.description}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.title },
        ]}
      />

      <section className="section-padding service-detail-section">
        <div className="section-container service-detail-layout">
          <div className="service-detail-main">
            <div className={`service-detail-visual service-card-media-${service.category}`}>
              <ServiceImage src={service.image} title={service.title} eager />
              {service.featured && <span className="service-card-featured">Signature</span>}
            </div>

            <div className="service-detail-copy">
              <h2>About this treatment</h2>
              <p>{service.longDescription ?? service.description}</p>

              {service.includes && service.includes.length > 0 && (
                <div className="detail-block">
                  <h3>What&apos;s included</h3>
                  <ul className="check-list">
                    {service.includes.map((item) => (
                      <li key={item}>
                        <span className="check-list-icon" aria-hidden="true">
                          <Icon name="check" size={14} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.goodToKnow && service.goodToKnow.length > 0 && (
                <div className="detail-block">
                  <h3>Good to know</h3>
                  <ul className="info-list">
                    {service.goodToKnow.map((item) => (
                      <li key={item}>
                        <span className="info-list-icon" aria-hidden="true">
                          <Icon name="info" size={14} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside className="service-detail-aside">
            <div className="booking-card">
              <span className="booking-card-eyebrow">Treatment details</span>
              <div className="booking-card-price">{service.price}</div>
              <span className="booking-card-duration">
                <Icon name="clock" size={15} />
                {service.duration ?? 'Duration confirmed at booking'}
              </span>

              <div className="booking-card-divider" />

              <dl className="booking-card-facts">
                <div>
                  <dt>Category</dt>
                  <dd>{category.label}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>In-salon</dd>
                </div>
              </dl>

              <ButtonLink
                to={`/booking?service=${encodeURIComponent(service.id)}`}
                variant="primary"
                fullWidth
                rightIcon={<Icon name="arrow-right" size={16} />}
              >
                Book this service
              </ButtonLink>

              <p className="booking-card-note">
                <Icon name="shield" size={14} />
                Payment is a simulated TEST demo after confirmation. No real money is charged.
              </p>
            </div>

            <div className="service-detail-help">
              <Icon name="phone" size={16} />
              <span>
                Have a question? <Link to="/contact">Contact the salon</Link>
              </span>
            </div>

            <Link to="/services" className="back-link">
              <Icon name="arrow-left" size={15} />
              Back to all services
            </Link>
          </aside>
        </div>
      </section>

      {(relatedLoading || related.length > 0) && (
        <section className="section-padding related-services" aria-label="Related services">
          <div className="section-container">
            <SectionHeader
              eyebrow="You may also like"
              title="Related Services"
              subtitle={`More ${category.label.toLowerCase()} treatments from our menu.`}
            />
            {relatedLoading ? (
              <div className="service-grid" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ServiceCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="service-grid">
                {related.map((item) => (
                  <ServiceCard key={item.id} service={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
