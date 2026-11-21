import { useState } from 'react'

interface ServiceImageProps {
  src?: string
  title: string
  className?: string
  eager?: boolean
}

export default function ServiceImage({
  src,
  title,
  className,
  eager = false,
}: ServiceImageProps) {
  const fallback = '/services/fallback.svg'
  const [currentSrc, setCurrentSrc] = useState(src || fallback)

  return (
    <img
      className={className}
      src={currentSrc}
      alt={`${title} at NF Signature Salon`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback)
      }}
    />
  )
}
