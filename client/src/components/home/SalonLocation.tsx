import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/common/Icon'
import { GOOGLE_MAPS_API_KEY, SALON_LOCATION } from '@/services/salonConfig'

interface GoogleLatLng {
  lat(): number
  lng(): number
}

interface GoogleLatLngLiteral {
  lat: number
  lng: number
}

interface GoogleMapsApi {
  maps: {
    Map: new (
      element: HTMLElement,
      options: { center: GoogleLatLng | GoogleLatLngLiteral; zoom: number }
    ) => object
    Marker: new (options: {
      map: object
      position: GoogleLatLng | GoogleLatLngLiteral
      title: string
    }) => {
      addListener(event: 'click', handler: () => void): void
    }
    InfoWindow: new (options: { content: HTMLElement }) => {
      open(options: { map: object; anchor: unknown }): void
    }
    Geocoder: new () => {
      geocode(
        request: { address: string },
        callback: (results: Array<{ geometry: { location: GoogleLatLng } }> | null, status: string) => void
      ): void
    }
    GeocoderStatus: { OK: string }
  }
}

declare global {
  interface Window {
    google?: GoogleMapsApi
    nfGoogleMapsReady?: () => void
    nfGoogleMapsPromise?: Promise<GoogleMapsApi>
  }
}

function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (window.google) return Promise.resolve(window.google)
  if (window.nfGoogleMapsPromise) return window.nfGoogleMapsPromise

  window.nfGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const source = new URL('https://maps.googleapis.com/maps/api/js')
    source.searchParams.set('key', GOOGLE_MAPS_API_KEY)
    source.searchParams.set('callback', 'nfGoogleMapsReady')
    source.searchParams.set('loading', 'async')
    script.src = source.toString()
    script.async = true
    script.defer = true
    window.nfGoogleMapsReady = () => {
      if (window.google) resolve(window.google)
      else reject(new Error('Google Maps did not initialize.'))
    }
    script.onerror = () => reject(new Error('Google Maps could not be loaded.'))
    document.head.appendChild(script)
  })

  return window.nfGoogleMapsPromise
}

export default function SalonLocation() {
  const mapElement = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState('')
  const configured = Boolean(GOOGLE_MAPS_API_KEY && SALON_LOCATION.address)

  useEffect(() => {
    if (!configured || !mapElement.current) return
    let cancelled = false

    void loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapElement.current) return
        const showMap = (position: GoogleLatLng | GoogleLatLngLiteral) => {
          const map = new google.maps.Map(mapElement.current!, {
            center: position,
            zoom: 16,
          })
          const marker = new google.maps.Marker({
            map,
            position,
            title: SALON_LOCATION.name,
          })
          const infoContent = document.createElement('div')
          infoContent.textContent = `${SALON_LOCATION.name} — ${SALON_LOCATION.displayAddress}`
          const infoWindow = new google.maps.InfoWindow({ content: infoContent })
          marker.addListener('click', () => infoWindow.open({ map, anchor: marker }))
        }

        if (
          SALON_LOCATION.latitude !== undefined &&
          SALON_LOCATION.longitude !== undefined
        ) {
          showMap({ lat: SALON_LOCATION.latitude, lng: SALON_LOCATION.longitude })
          return
        }

        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: SALON_LOCATION.displayAddress }, (results, status) => {
          if (cancelled) return
          const position = results?.[0]?.geometry.location
          if (status !== google.maps.GeocoderStatus.OK || !position) {
            setMapError('We could not locate the configured salon address.')
            return
          }
          showMap(position)
        })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : 'Google Maps could not be loaded.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [configured])

  const directionsUrl = SALON_LOCATION.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SALON_LOCATION.displayAddress)}`
    : undefined

  return (
    <section className="section-padding salon-location-section" aria-labelledby="salon-location-title">
      <div className="section-container salon-location-layout">
        <div className="salon-location-copy">
          <p className="salon-location-eyebrow">Visit us</p>
          <h2 id="salon-location-title">Find Our Salon</h2>
          <div className="salon-location-name">
            <Icon name="map-pin" size={20} />
            <strong>{SALON_LOCATION.name}</strong>
          </div>
          <p className="salon-location-address">
            {SALON_LOCATION.displayAddress}
          </p>
          {directionsUrl ? (
            <a className="salon-directions-link" href={directionsUrl} target="_blank" rel="noreferrer">
              Get Directions <span aria-hidden="true">→</span>
            </a>
          ) : (
            <p className="salon-map-note">
              Exact salon address will be added when confirmed.
            </p>
          )}
        </div>

        <div className="salon-map-frame">
          {configured && !mapError ? (
            <div ref={mapElement} className="salon-map" aria-label="Map showing NF Signature Salon" />
          ) : mapError ? (
            <div className="salon-map-placeholder" role="status">
              <Icon name="map-pin" size={32} />
              <strong>Map location is unavailable</strong>
              <span>{mapError}</span>
            </div>
          ) : (
            <div className="salon-map-placeholder" role="status">
              <Icon name="map-pin" size={32} />
              <strong>Map location is being configured</strong>
              <span>
                {!GOOGLE_MAPS_API_KEY
                  ? 'Add a Google Maps API key to the client environment.'
                  : 'Add the confirmed salon street address to the client environment.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
