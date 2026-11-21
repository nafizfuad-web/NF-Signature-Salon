import { useApiResource } from '@/hooks/useApiResource'
import { fetchServiceById, fetchServices } from '@/services/api/services'
import type { ServiceItem } from '@/types'

export function useServices() {
  return useApiResource<ServiceItem[]>(() => fetchServices(), [])
}

export function useService(serviceId: string | undefined) {
  return useApiResource<ServiceItem | null>(async () => {
    if (!serviceId) return null
    return fetchServiceById(serviceId)
  }, [serviceId])
}
