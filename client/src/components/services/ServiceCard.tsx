import { Link } from 'react-router-dom'
import Icon from '@/components/common/Icon'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import ServiceImage from '@/components/services/ServiceImage'
import type { ServiceItem } from '@/types'

interface ServiceCardProps {
  service: ServiceItem
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const category = CATEGORY_META[service.category]

  return (
    <Link
      to={`/services/${service.id}`}
      className="service-card"
      aria-label={`View ${service.title}`}
    >
      <div className={`service-card-media service-card-media-${service.category}`}>
        <ServiceImage src={service.image} title={service.title} />
        {service.featured && <span className="service-card-featured">Signature</span>}
        <span className="service-card-category">{category.label}</span>
      </div>

      <div className="service-card-body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>

        <div className="service-card-meta">
          <span className="service-card-price">{service.price}</span>
          {service.duration && (
            <span className="service-card-duration">
              <Icon name="clock" size={14} />
              {service.duration}
            </span>
          )}
        </div>

        <span className="service-card-link">
          View details
          <Icon name="arrow-right" size={15} />
        </span>
      </div>
    </Link>
  )
}
