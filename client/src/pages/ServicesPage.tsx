import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import PageHeader from '@/components/common/PageHeader'
import ServiceCard from '@/components/services/ServiceCard'
import ServiceCardSkeleton from '@/components/services/ServiceCardSkeleton'
import ServiceFilters, { type ServiceSort } from '@/components/services/ServiceFilters'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import { useServices } from '@/hooks/useServices'
import { useToast } from '@/hooks/useToast'
import type { ServiceCategory, ServiceItem } from '@/types'
import { parsePrice } from '@/utils/format'

const VALID_CATEGORIES: ServiceCategory[] = ['hair', 'skin', 'nails', 'wellness']
const VALID_SORTS: ServiceSort[] = ['recommended', 'price-asc', 'price-desc']

function parseCategory(value: string | null): ServiceCategory | 'all' {
  return value && VALID_CATEGORIES.includes(value as ServiceCategory)
    ? (value as ServiceCategory)
    : 'all'
}

function parseSort(value: string | null): ServiceSort {
  return value && VALID_SORTS.includes(value as ServiceSort)
    ? (value as ServiceSort)
    : 'recommended'
}

function matchesSearch(service: ServiceItem, search: string): boolean {
  if (!search) return true
  const haystack = [
    service.title,
    service.description,
    service.longDescription,
    service.category,
    CATEGORY_META[service.category].label,
    ...(service.includes ?? []),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, loading, error, refetch } = useServices()
  const { toast } = useToast()
  const lastError = useRef<string | null>(null)

  const search = searchParams.get('q') ?? ''
  const category = parseCategory(searchParams.get('category'))
  const sort = parseSort(searchParams.get('sort'))

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load services', error)
    }
  }, [error, toast])

  const services = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = (data ?? []).filter(
      (service) =>
        matchesSearch(service, normalizedSearch) &&
        (category === 'all' || service.category === category)
    )

    if (sort === 'price-asc') {
      return [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    }
    if (sort === 'price-desc') {
      return [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    }
    return filtered
  }, [data, search, category, sort])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    const isDefault =
      value === '' ||
      value === 'all' ||
      value === 'recommended'
    if (isDefault) next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('category')
    next.delete('sort')
    setSearchParams(next, { replace: true })
  }

  const totalCount = data?.length ?? 0

  return (
    <>
      <PageHeader
        eyebrow="Our menu"
        title="Browse Services"
        subtitle="Explore hair, skin, nail and wellness treatments. Search by name, filter by category, or sort by price to find your next appointment."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
        actions={
          <ButtonLink to="/booking" variant="primary" rightIcon={<Icon name="arrow-right" size={16} />}>
            Book an appointment
          </ButtonLink>
        }
      />

      <section className="section-padding services-page" aria-label="Service catalogue">
        <div className="section-container">
          <ServiceFilters
            search={search}
            category={category}
            sort={sort}
            resultCount={services.length}
            totalCount={totalCount}
            onSearchChange={(value) => updateParam('q', value)}
            onCategoryChange={(value) => updateParam('category', value)}
            onSortChange={(value) => updateParam('sort', value)}
            onClear={clearFilters}
          />

          {loading ? (
            <div className="service-grid" aria-busy="true" aria-label="Loading services">
              {Array.from({ length: 6 }).map((_, index) => (
                <ServiceCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="We couldn't load the menu"
              message={error}
              onRetry={refetch}
            />
          ) : services.length === 0 ? (
            <EmptyState
              icon="search"
              title="No services match your search"
              description={
                totalCount === 0
                  ? 'The service menu is empty right now. Please check back soon.'
                  : 'Try a different search term, choose another category, or clear your filters.'
              }
              action={
                <button type="button" className="btn btn-outline btn-md" onClick={clearFilters}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="service-grid">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
