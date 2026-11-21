import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import ServiceFilters, { type ServiceSort } from '@/components/services/ServiceFilters'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import { useServices } from '@/hooks/useServices'
import { useToast } from '@/hooks/useToast'
import type { ServiceCategory } from '@/types'
import { parsePrice } from '@/utils/format'

function AdminServicesContent() {
  const { data, loading, error, refetch } = useServices()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all')
  const [sort, setSort] = useState<ServiceSort>('recommended')
  const lastError = useRef<string | null>(null)

  useEffect(() => {
    if (error && lastError.current !== error) {
      lastError.current = error
      toast.error('Could not load services', error)
    }
  }, [error, toast])

  const services = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = (data ?? []).filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        [service.title, service.description, service.category, CATEGORY_META[service.category].label]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      const matchesCategory = category === 'all' || service.category === category
      return matchesSearch && matchesCategory
    })

    if (sort === 'price-asc') {
      return [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    }
    if (sort === 'price-desc') {
      return [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    }
    return filtered
  }, [data, search, category, sort])

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setSort('recommended')
  }

  return (
    <>
      <DashboardPageHeader
        eyebrow="Salon operations"
        title="Services"
        description="Review the active treatment menu. Editing will be enabled when the admin API is connected."
        actions={
          <ButtonLink to="/services" variant="outline" leftIcon={<Icon name="sparkles" size={15} />}>
            View public menu
          </ButtonLink>
        }
      />

      <ServiceFilters
        search={search}
        category={category}
        sort={sort}
        resultCount={services.length}
        totalCount={data?.length ?? 0}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onClear={clearFilters}
      />

      <DashboardCard padded={false}>
        {loading ? (
          <div className="dashboard-card-pad">
            <TableSkeleton rows={6} columns={5} />
          </div>
        ) : error ? (
          <div className="dashboard-card-pad">
            <ErrorState
              title="We couldn't load the service menu"
              message={error}
              onRetry={refetch}
            />
          </div>
        ) : services.length === 0 ? (
          <div className="dashboard-card-pad">
            <EmptyState
              icon="search"
              title="No services match"
              description="Try a different search term or clear the category filter."
              action={
                <button type="button" className="btn btn-outline btn-md" onClick={clearFilters}>
                  Clear filters
                </button>
              }
            />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table admin-services-table">
              <caption className="sr-only">Active salon services</caption>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Category</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="table-service">
                        <strong>{service.title}</strong>
                        <span>{service.description}</span>
                      </div>
                    </td>
                    <td>{CATEGORY_META[service.category].label}</td>
                    <td>{service.duration ?? '—'}</td>
                    <td>{service.price}</td>
                    <td>
                      <span className="badge badge-gold">Active</span>
                      {service.featured && <span className="badge badge-outline">Featured</span>}
                    </td>
                    <td>
                      <Link to={`/services/${service.id}`} className="table-action-link">
                        View
                        <Icon name="arrow-right" size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </>
  )
}

export default function AdminServicesPage() {
  return (
    <DashboardAccessGate role="admin">
      <AdminServicesContent />
    </DashboardAccessGate>
  )
}
