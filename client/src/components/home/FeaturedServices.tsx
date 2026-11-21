import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import SectionHeader from '@/components/common/SectionHeader'
import ServiceCard from '@/components/services/ServiceCard'
import ServiceCardSkeleton from '@/components/services/ServiceCardSkeleton'
import { useServices } from '@/hooks/useServices'

// NF Signature Salon — Featured services section
// Renders the most loved treatments as a grid of service cards.

export default function FeaturedServices() {
  const { data, loading, error, refetch } = useServices()
  const featured = data?.filter((service) => service.featured).slice(0, 6) ?? []

  return (
    <section className="home-featured" aria-label="Featured services">
      <div className="section-container">
        <SectionHeader
          eyebrow="Featured treatments"
          title="Featured Services"
          subtitle="Our signature services, chosen by our clients for results that speak for themselves."
        />

        {loading ? (
          <div className="service-grid" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load services"
            message={error}
            onRetry={refetch}
            compact
          />
        ) : featured.length === 0 ? (
          <EmptyState
            icon="sparkles"
            title="Featured services are on their way"
            description="Browse the full menu while we prepare this month's highlights."
            action={<ButtonLink to="/services" variant="outline">Browse all services</ButtonLink>}
            compact
          />
        ) : (
          <div className="service-grid">
            {featured.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        <div className="home-featured-footer">
          <ButtonLink to="/services" variant="outline">
            View all services
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
