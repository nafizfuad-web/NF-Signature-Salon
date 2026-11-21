import { useCallback, useEffect, useRef, useState } from 'react'
import type { DependencyList, Dispatch, SetStateAction } from 'react'
import { getErrorMessage, getErrorStatus } from '@/utils/errors'

export interface ApiResource<T> {
  data: T | null
  loading: boolean
  error: string | null
  errorStatus?: number
  refetch: () => void
  setData: Dispatch<SetStateAction<T | null>>
}

/**
 * Small data-fetching hook used by the service catalog and dashboards.
 *
 * `loader` is kept in a ref so callers can pass inline async functions without
 * causing an infinite fetch loop. Pass real dependencies (ids, filters) in the
 * second argument.
 */
export function useApiResource<T>(
  loader: () => Promise<T>,
  deps: DependencyList = []
): ApiResource<T> {
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setErrorStatus(undefined)

    loaderRef
      .current()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((caught: unknown) => {
        if (!active) return
        setError(getErrorMessage(caught))
        setErrorStatus(getErrorStatus(caught))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // Callers own the dependency list; reloadKey powers refetch().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, loading, error, errorStatus, refetch, setData }
}
