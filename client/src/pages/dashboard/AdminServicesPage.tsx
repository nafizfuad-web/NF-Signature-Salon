import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import ButtonLink from '@/components/common/ButtonLink'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import Icon from '@/components/common/Icon'
import AdminCard from '@/components/dashboard/AdminCard'
import AdminPageHeader from '@/components/dashboard/AdminPageHeader'
import DashboardAccessGate from '@/components/dashboard/DashboardAccessGate'
import TableSkeleton from '@/components/dashboard/TableSkeleton'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import {
  createAdminService,
  deleteAdminService,
  fetchAdminServices,
  updateAdminService,
} from '@/services/api/admin'
import type { AdminServicePayload, ServiceCategory, ServiceItem } from '@/types'
import { formatMoney, parsePrice } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

type ActiveFilter = 'all' | 'active' | 'inactive'
type ServiceSort = 'recommended' | 'price-asc' | 'price-desc'

interface ServiceFormState {
  title: string
  category: ServiceCategory
  description: string
  price: string
  priceAmount: string
  durationMinutes: string
  featured: boolean
  active: boolean
}

const EMPTY_FORM: ServiceFormState = {
  title: '',
  category: 'hair',
  description: '',
  price: '',
  priceAmount: '',
  durationMinutes: '',
  featured: false,
  active: true,
}

function durationMinutesFromService(service: ServiceItem): string {
  const match = service.duration?.match(/(\d+)/)
  return match?.[1] ?? ''
}

function AdminServicesContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all')
  const [sort, setSort] = useState<ServiceSort>('recommended')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceItem | null>(null)
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const { data, loading, error, refetch, setData } = useApiResource<ServiceItem[]>(
    () =>
      fetchAdminServices({
        q: search,
        category,
        active: activeFilter === 'all' ? '' : activeFilter === 'active' ? 'true' : 'false',
      }),
    [user?.id, search, category, activeFilter]
  )

  const services = useMemo(() => {
    const list = [...(data ?? [])]
    if (sort === 'price-asc') list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    if (sort === 'price-desc') list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    return list
  }, [data, sort])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (service: ServiceItem) => {
    setEditing(service)
    setForm({
      title: service.title,
      category: service.category,
      description: service.description,
      price: service.price,
      priceAmount: service.priceAmount ? String(service.priceAmount) : '',
      durationMinutes: durationMinutesFromService(service),
      featured: Boolean(service.featured),
      active: service.active !== false,
    })
    setImageFile(null)
    setFormError(null)
    setFormOpen(true)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (file && !file.type.startsWith('image/')) {
      toast.error('Invalid image', 'Choose a JPG, PNG, WEBP or GIF image.')
      event.target.value = ''
      return
    }
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Image too large', 'Service images must be 5 MB or smaller.')
      event.target.value = ''
      return
    }
    setImageFile(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    const priceAmount = Number(form.priceAmount)
    const durationMinutes = Number(form.durationMinutes)
    if (!form.title.trim()) return setFormError('Service name is required.')
    if (!form.description.trim()) return setFormError('Description is required.')
    if (!editing && (!Number.isInteger(priceAmount) || priceAmount < 1)) {
      return setFormError('Price must be a positive whole number.')
    }
    if (form.priceAmount.trim() && (!Number.isInteger(priceAmount) || priceAmount < 1)) {
      return setFormError('Price must be a positive whole number.')
    }
    if (!editing && (!Number.isInteger(durationMinutes) || durationMinutes < 5)) {
      return setFormError('Duration must be a positive number of minutes.')
    }
    if (form.durationMinutes.trim() && (!Number.isInteger(durationMinutes) || durationMinutes < 5)) {
      return setFormError('Duration must be a positive number of minutes.')
    }

    const payload: Partial<AdminServicePayload> = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      price: form.price.trim() || undefined,
      featured: form.featured,
      active: form.active,
    }
    if (form.priceAmount.trim()) payload.priceAmount = priceAmount
    if (form.durationMinutes.trim()) payload.durationMinutes = durationMinutes
    if (!editing && payload.priceAmount === undefined) {
      return setFormError('Price is required for a new service.')
    }
    if (!editing && payload.durationMinutes === undefined) {
      return setFormError('Duration is required for a new service.')
    }

    setSaving(true)
    try {
      if (editing) {
        const updated = await updateAdminService(editing.id, payload, imageFile)
        setData((current) => current?.map((item) => (item.id === editing.id ? updated : item)) ?? current)
        toast.success('Service updated', `${updated.title} has been saved.`)
      } else {
        const created = await createAdminService(payload as AdminServicePayload, imageFile)
        setData((current) => [created, ...(current ?? [])])
        toast.success('Service created', `${created.title} is now in the catalogue.`)
      }
      setFormOpen(false)
      setEditing(null)
      setImageFile(null)
      if (imageInputRef.current) imageInputRef.current.value = ''
    } catch (caught) {
      const message = getErrorMessage(caught, 'Unable to save this service.')
      setFormError(message)
      toast.error('Could not save service', message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (service: ServiceItem) => {
    setBusyId(service.id)
    try {
      const updated = await updateAdminService(service.id, { active: service.active === false })
      setData((current) => current?.map((item) => (item.id === service.id ? updated : item)) ?? current)
      toast.success(updated.active === false ? 'Service deactivated' : 'Service activated', updated.title)
    } catch (caught) {
      toast.error('Could not update service', getErrorMessage(caught))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (service: ServiceItem) => {
    if (!window.confirm(`Delete "${service.title}"? Services with booking history are deactivated instead.`)) return
    setBusyId(service.id)
    try {
      await deleteAdminService(service.id)
      setData((current) => current?.filter((item) => item.id !== service.id) ?? current)
      toast.success('Service removed', service.title)
    } catch (caught) {
      toast.error('Could not delete service', getErrorMessage(caught))
    } finally {
      setBusyId(null)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setSort('recommended')
    setActiveFilter('all')
  }

  const hasFilters = search.trim() !== '' || category !== 'all' || activeFilter !== 'all'

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Create, edit and manage the treatments in the salon catalogue."
        actions={
          <>
            <Button variant="primary" onClick={openCreate} leftIcon={<Icon name="plus" size={16} />}>
              Add service
            </Button>
            <ButtonLink to="/services" variant="outline" leftIcon={<Icon name="sparkles" size={15} />}>
              View public menu
            </ButtonLink>
          </>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <span className="admin-search-icon" aria-hidden="true">
            <Icon name="search" size={17} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear service search"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>

        <select
          className="admin-select"
          value={category}
          onChange={(event) => setCategory(event.target.value as ServiceCategory | 'all')}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>

        <select
          className="admin-select"
          value={sort}
          onChange={(event) => setSort(event.target.value as ServiceSort)}
          aria-label="Sort services"
        >
          <option value="recommended">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>

        <div className="admin-filter-tabs" role="group" aria-label="Filter services by status">
          {(['all', 'active', 'inactive'] as ActiveFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={`admin-filter-tab ${activeFilter === value ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(value)}
              aria-pressed={activeFilter === value}
            >
              {value === 'all' ? 'All' : value === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>

        <span className="admin-results-meta">
          Showing <strong>{services.length}</strong> of {data?.length ?? 0}
        </span>

        {hasFilters && (
          <button type="button" className="admin-text-button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {formOpen && (
        <AdminCard
          title={editing ? 'Edit service' : 'Add service'}
          description="Only active services appear on public pages and can be booked."
          className="admin-form-card"
        >
          {formError && (
            <div className="auth-alert" role="alert">
              <Icon name="alert-circle" size={17} />
              <span>{formError}</span>
            </div>
          )}
          <form className="profile-form admin-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              <label className="form-field">
                <span>Service name</span>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                />
              </label>
              <label className="form-field">
                <span>Category</span>
                <select
                  className="form-input"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value as ServiceCategory })}
                >
                  {Object.entries(CATEGORY_META).map(([value, meta]) => (
                    <option key={value} value={value}>{meta.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="form-field">
              <span>Description</span>
              <textarea
                className="form-input"
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
              />
            </label>
            <div className="form-grid-2">
              <label className="form-field">
                <span>Price (BDT amount)</span>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  step="1"
                  value={form.priceAmount}
                  onChange={(event) => setForm({ ...form, priceAmount: event.target.value })}
                  required={!editing}
                />
              </label>
              <label className="form-field">
                <span>Duration (minutes)</span>
                <input
                  className="form-input"
                  type="number"
                  min="5"
                  step="1"
                  value={form.durationMinutes}
                  onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
                  required={!editing}
                />
              </label>
            </div>
            <label className="form-field">
              <span>Display price (optional)</span>
              <input
                className="form-input"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                placeholder="৳1,500"
              />
            </label>
            <label className="form-field">
              <span>Service image</span>
              <input
                ref={imageInputRef}
                className="form-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
              />
              <small>{editing?.image ? 'Leave empty to keep the current image.' : 'JPG, PNG, WEBP or GIF up to 5 MB.'}</small>
            </label>
            <div className="form-checks">
              <label>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                />
                Featured
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="profile-form-actions">
              <Button type="submit" loading={saving}>
                {editing ? 'Save changes' : 'Create service'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormOpen(false)
                  setEditing(null)
                  setImageFile(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard padded={false}>
        {loading ? (
          <div className="admin-card-pad">
            <TableSkeleton rows={6} columns={6} />
          </div>
        ) : error ? (
          <div className="admin-card-pad">
            <ErrorState title="We couldn't load services" message={error} onRetry={refetch} />
          </div>
        ) : services.length === 0 ? (
          <div className="admin-card-pad">
            <EmptyState
              icon="search"
              title="No services found"
              description="Try another search or add a new service."
              action={<Button variant="outline" onClick={openCreate}>Add service</Button>}
            />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-services-table">
              <caption className="sr-only">Admin service catalogue</caption>
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
                      <div className="admin-service-copy">
                        <strong>{service.title}</strong>
                        <span>{service.description}</span>
                      </div>
                    </td>
                    <td>{CATEGORY_META[service.category]?.label ?? service.category}</td>
                    <td>{service.duration ?? '—'}</td>
                    <td>{service.price || (service.priceAmount ? formatMoney(service.priceAmount) : '—')}</td>
                    <td>
                      <span className={`admin-badge ${service.active === false ? 'is-muted' : 'is-gold'}`}>
                        {service.active === false ? 'Inactive' : 'Active'}
                      </span>
                      {service.featured && <span className="admin-badge is-muted">Featured</span>}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {service.active !== false && (
                          <Link
                            to={`/services/${service.id}`}
                            className="admin-icon-button"
                            aria-label={`View ${service.title}`}
                            title="View public service"
                          >
                            <Icon name="eye" size={17} />
                          </Link>
                        )}
                        <button
                          type="button"
                          className="admin-icon-button"
                          onClick={() => openEdit(service)}
                          aria-label={`Edit ${service.title}`}
                          title="Edit service"
                        >
                          <Icon name="pencil" size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button"
                          disabled={busyId === service.id}
                          onClick={() => void toggleActive(service)}
                          aria-label={service.active === false ? `Activate ${service.title}` : `Deactivate ${service.title}`}
                          title={service.active === false ? 'Activate service' : 'Deactivate service'}
                        >
                          <Icon name="power" size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button is-danger"
                          disabled={busyId === service.id}
                          onClick={() => void handleDelete(service)}
                          aria-label={`Delete ${service.title}`}
                          title="Delete service"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
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
