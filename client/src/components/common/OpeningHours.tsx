import { SALON_LOCATION } from '@/services/salonConfig'

interface OpeningHoursProps {
  compact?: boolean
}

export default function OpeningHours({ compact = false }: OpeningHoursProps) {
  const configuredHours = SALON_LOCATION.openingHours.filter((entry) => entry.hours)

  if (!configuredHours.length) {
    return (
      <p className={compact ? 'opening-hours-note opening-hours-note-compact' : 'opening-hours-note'}>
        Opening hours have not been confirmed yet.
      </p>
    )
  }

  return (
    <div className={compact ? 'opening-hours opening-hours-compact' : 'opening-hours'}>
      <ul>
        {configuredHours.map((entry) => (
          <li key={entry.day}>
            <span>{entry.day}</span>
            <span>{entry.hours}</span>
          </li>
        ))}
      </ul>
      {configuredHours.length < SALON_LOCATION.openingHours.length && (
        <p className="opening-hours-note">Hours for other days have not been configured.</p>
      )}
    </div>
  )
}
