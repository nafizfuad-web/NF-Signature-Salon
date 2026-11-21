import Icon from '@/components/common/Icon'
import { CATEGORY_OPTIONS } from '@/components/services/categoryMeta'
import type { ServiceCategory } from '@/types'
import { cn } from '@/lib/cn'

export type ServiceSort = 'recommended' | 'price-asc' | 'price-desc'

interface ServiceFiltersProps {
  search: string
  category: ServiceCategory | 'all'
  sort: ServiceSort
  resultCount: number
  totalCount: number
  onSearchChange: (value: string) => void
  onCategoryChange: (category: ServiceCategory | 'all') => void
  onSortChange: (sort: ServiceSort) => void
  onClear: () => void
}

export default function ServiceFilters({
  search,
  category,
  sort,
  resultCount,
  totalCount,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onClear,
}: ServiceFiltersProps) {
  const hasFilters = Boolean(search) || category !== 'all' || sort !== 'recommended'

  return (
    <div className="services-toolbar">
      <div className="services-toolbar-row">
        <div className="search-field">
          <span className="search-field-icon" aria-hidden="true">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search treatments, categories…"
            aria-label="Search services"
          />
          {search && (
            <button
              type="button"
              className="search-field-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <Icon name="x" size={15} />
            </button>
          )}
        </div>

        <label className="sort-field">
          <span className="sort-field-label">Sort by</span>
          <span className="sort-field-control">
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ServiceSort)}
              aria-label="Sort services"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <Icon name="chevron-down" size={15} />
          </span>
        </label>
      </div>

      <div className="services-toolbar-row services-toolbar-row-wrap">
        <div className="category-chips" role="group" aria-label="Filter services by category">
          <button
            type="button"
            className={cn('chip', category === 'all' && 'chip-active')}
            onClick={() => onCategoryChange('all')}
            aria-pressed={category === 'all'}
          >
            All services
          </button>
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn('chip', category === option.id && 'chip-active')}
              onClick={() => onCategoryChange(option.id)}
              aria-pressed={category === option.id}
            >
              <Icon name={option.icon} size={14} />
              {option.label}
            </button>
          ))}
        </div>

        <div className="results-meta" aria-live="polite">
          <span>
            Showing <strong>{resultCount}</strong> of {totalCount} services
          </span>
          {hasFilters && (
            <button type="button" className="link-button" onClick={onClear}>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
