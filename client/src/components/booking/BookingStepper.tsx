import { cn } from '@/lib/cn'

// NF Signature Salon — Booking step indicator
// Shows the customer where they are in the booking flow. Steps already
// completed can be clicked to go back.

interface BookingStep {
  id: number
  label: string
}

interface BookingStepperProps {
  steps: BookingStep[]
  current: number
  maxReached: number
  onStepClick: (step: number) => void
}

export default function BookingStepper({
  steps,
  current,
  maxReached,
  onStepClick,
}: BookingStepperProps) {
  return (
    <ol className="booking-stepper" aria-label="Booking progress">
      {steps.map((step) => {
        const isActive = step.id === current
        const isComplete = step.id < current
        const isReachable = step.id <= maxReached && step.id !== current

        return (
          <li
            key={step.id}
            className={cn(
              'booking-step',
              isActive && 'is-active',
              isComplete && 'is-complete'
            )}
          >
            <button
              type="button"
              className="booking-step-button"
              aria-current={isActive ? 'step' : undefined}
              disabled={!isReachable}
              onClick={() => onStepClick(step.id)}
            >
              <span className="booking-step-index" aria-hidden="true">
                {isComplete ? '✓' : step.id}
              </span>
              <span className="booking-step-label">{step.label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
