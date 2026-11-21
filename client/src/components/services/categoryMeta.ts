import type { IconName } from '@/components/common/Icon'
import type { ServiceCategory } from '@/types'

export interface CategoryMeta {
  label: string
  icon: IconName
  description: string
}

export const CATEGORY_META: Record<ServiceCategory, CategoryMeta> = {
  hair: {
    label: 'Hair',
    icon: 'scissors',
    description: 'Precision cuts, colour and styling',
  },
  skin: {
    label: 'Skin',
    icon: 'droplet',
    description: 'Facials, peels and glow treatments',
  },
  nails: {
    label: 'Nails',
    icon: 'sparkles',
    description: 'Manicures, pedicures and nail art',
  },
  wellness: {
    label: 'Wellness',
    icon: 'heart',
    description: 'Massage, relaxation and therapy',
  },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([id, meta]) => ({
  id: id as ServiceCategory,
  ...meta,
}))
