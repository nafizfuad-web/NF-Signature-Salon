import Icon from '@/components/common/Icon'
import { CATEGORY_META } from '@/components/services/categoryMeta'
import type { ServiceCategory } from '@/types'

interface CategoryIconProps {
  category: ServiceCategory
  size?: number
}

export default function CategoryIcon({ category, size = 22 }: CategoryIconProps) {
  return <Icon name={CATEGORY_META[category].icon} size={size} />
}
