import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import Icon from '@/components/common/Icon'
import { SALON_LOCATION } from '@/services/salonConfig'

// NF Signature Salon — OpenStreetMap location section.
//
// Uses Leaflet + OpenStreetMap (no Google Maps API key). Pabna city centre is
// used as an approximate temporary location; it is never presented as the exact
// business address. The location copy/layout is unchanged from the design.

const PABNA_CENTER: [number, number] = [24.0064, 89.2336]

const salonMarkerIcon = L.divIcon({
  className: 'salon-map-marker',
  html: '<span aria-hidden="true"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
})

export default function SalonLocation() {
  const hasCoordinates =
    SALON_LOCATION.latitude !== undefined && SALON_LOCATION.longitude !== undefined

  const position: [number, number] = hasCoordinates
    ? [SALON_LOCATION.latitude as number, SALON_LOCATION.longitude as number]
    : PABNA_CENTER

  const isApproximate = !hasCoordinates
  const hasAddress = Boolean(SALON_LOCATION.address)
  const locationLabel = hasAddress
    ? SALON_LOCATION.displayAddress
    : `${SALON_LOCATION.name}, Pabna, Bangladesh (approximate city-centre location)`

  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${position[0]}&mlon=${position[1]}#map=15/${position[0]}/${position[1]}`

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
            {hasAddress ? SALON_LOCATION.displayAddress : 'Pabna, Bangladesh'}
          </p>

          {isApproximate && (
            <p className="salon-map-note">
              Approximate city-centre location. The exact salon address will be published once it
              is confirmed — this pin is not the verified business address.
            </p>
          )}

          <a
            className="salon-directions-link"
            href={openStreetMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            View on OpenStreetMap <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="salon-map-frame">
          <div
            className="salon-map"
            role="region"
            aria-label="Interactive OpenStreetMap showing the approximate salon location in Pabna, Bangladesh"
          >
            <MapContainer
              center={position}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={salonMarkerIcon}>
                <Popup>
                  <strong>{SALON_LOCATION.name}</strong>
                  <br />
                  {hasAddress ? locationLabel : 'Pabna, Bangladesh (approximate location)'}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
