import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import {
  createBkashCheckoutSession,
  createPaymentSession,
  createStripeCheckoutSession,
  fetchAppointmentPayment,
  fetchPaymentMethods,
  simulatePaymentOutcome,
} from '@/services/api/payments'
import type {
  Appointment,
  PaymentMethod,
  PaymentMethodsResponse,
  PaymentMethodId,
  PaymentSimulationOutcome,
  PaymentTransaction,
} from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatShortDate } from '@/utils/format'

interface PaymentPanelProps {
  appointment: Appointment
  onClose: () => void
  onChanged: () => void
}

const METHOD_LABELS: Record<PaymentMethodId, string> = {
  stripe: 'Card via Stripe',
  bkash: 'bKash',
  nagad: 'Nagad',
  stripe_demo: 'Stripe Demo',
  bkash_demo: 'bKash Demo',
  nagad_demo: 'Nagad Demo',
  pay_at_salon: 'Pay at Salon',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Payment pending',
  processing: 'Processing',
  succeeded: 'Paid',
  cash_pending: 'Pay at salon',
  cash_received: 'Cash received',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

function isActive(transaction: PaymentTransaction | null): boolean {
  return Boolean(
    transaction &&
      ['pending', 'processing', 'cash_pending'].includes(transaction.paymentStatus)
  )
}

export default function PaymentPanel({ appointment, onClose, onChanged }: PaymentPanelProps) {
  const [methods, setMethods] = useState<PaymentMethodsResponse | null>(null)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [methodsPayload, paymentState] = await Promise.all([
          fetchPaymentMethods(),
          fetchAppointmentPayment(appointment.id),
        ])
        if (cancelled) return
        setMethods(methodsPayload)
        setTransaction(paymentState.transaction)
      } catch (caught) {
        if (!cancelled) setError(getErrorMessage(caught, 'Unable to load TEST payments.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [appointment.id])

  const activeTransaction = useMemo(() => (isActive(transaction) ? transaction : null), [transaction])
  const settledTransaction = useMemo(
    () =>
      transaction && ['succeeded', 'cash_received'].includes(transaction.paymentStatus)
        ? transaction
        : null,
    [transaction]
  )

  async function chooseMethod(method: PaymentMethod) {
    if (busy || activeTransaction || !method.available) return
    setBusy(true)
    setError(null)
    try {
      if (method.id === 'stripe') {
        const result = await createStripeCheckoutSession(appointment.id)
        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl)
          return
        }
        setTransaction(result.transaction)
      } else if (method.id === 'bkash') {
        const result = await createBkashCheckoutSession(appointment.id)
        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl)
          return
        }
        setTransaction(result.transaction)
      } else {
        const result = await createPaymentSession(appointment.id, method.id)
        setTransaction(result.transaction)
      }
      onChanged()
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to start payment.'))
    } finally {
      setBusy(false)
    }
  }

  async function simulate(outcome: PaymentSimulationOutcome) {
    if (!transaction || busy) return
    setBusy(true)
    setError(null)
    try {
      const result = await simulatePaymentOutcome(transaction.id, outcome)
      setTransaction(result.transaction)
      onChanged()
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to simulate TEST payment.'))
    } finally {
      setBusy(false)
    }
  }

  const amountLabel = methods?.amount != null ? `BDT ${methods.amount}` : 'TEST amount'
  const methodOptions = useMemo(() => methods?.methods ?? [], [methods])
  const hasStripe = useMemo(
    () => methodOptions.some((method) => method.id === 'stripe' && method.available),
    [methodOptions]
  )

  function methodAmountLabel(method: PaymentMethod): string {
    if (method.mode === 'real' || method.id === 'pay_at_salon') {
      return appointment.priceAmount ? `BDT ${appointment.priceAmount}` : 'At checkout'
    }
    return amountLabel
  }

  function unavailableReason(reason: string | null): string {
    if (!reason) return 'Unavailable'
    if (reason.includes('not_configured')) return 'Not configured'
    if (reason.includes('sandbox_only') || reason.includes('sandbox_credentials_required')) {
      return 'Sandbox credentials required'
    }
    if (reason.includes('disabled') || reason.includes('not_enabled')) return 'Currently disabled'
    return 'Unavailable'
  }

  function methodHint(method: PaymentMethod): string {
    if (!method.available) return unavailableReason(method.reason)
    if (method.mode === 'real') {
      if (method.id === 'stripe') return 'Secure card payment'
      if (method.id === 'bkash') return 'bKash sandbox checkout'
      if (method.id === 'nagad') return 'Nagad sandbox checkout'
      return 'Provider checkout'
    }
    return method.requiresSimulation ? 'Simulated gateway' : 'Salon cash'
  }

  return (
    <div className="payment-panel">
      <div className="payment-panel-head">
        <div>
          <span className="payment-panel-eyebrow">{methods?.simulated ? 'TEST payment' : 'Payment'}</span>
          <h3>{appointment.serviceTitle}</h3>
          <p>
            {formatShortDate(appointment.date)} · {appointment.time} · Display price{' '}
            {appointment.price ?? '—'} · {methods?.simulated ? `Demo amount ${amountLabel}` : 'Amount confirmed at checkout'}
          </p>
        </div>
        <button type="button" className="payment-panel-close" onClick={onClose} aria-label="Close payment panel">
          <Icon name="x" size={18} />
        </button>
      </div>

      {loading ? (
        <p className="payment-panel-note">Loading payment options…</p>
      ) : error ? (
        <p className="payment-panel-error">{error}</p>
      ) : methodOptions.length === 0 ? (
        <p className="payment-panel-note">
          No payment methods are currently available. Check the server payment configuration.
        </p>
      ) : settledTransaction ? (
        <div className="payment-result payment-result-success">
          <Icon name="check" size={18} />
          <div>
            <strong>{STATUS_LABELS[settledTransaction.paymentStatus] ?? 'Paid'}</strong>
            <span>
              {METHOD_LABELS[settledTransaction.paymentMethod]} · BDT {settledTransaction.amount} · {settledTransaction.environment}
            </span>
          </div>
        </div>
      ) : activeTransaction ? (
        <div className="payment-active">
          <div className="payment-result">
            <Icon name="clock" size={18} />
            <div>
              <strong>{STATUS_LABELS[activeTransaction.paymentStatus] ?? 'Payment pending'}</strong>
              <span>
                {METHOD_LABELS[activeTransaction.paymentMethod]} · BDT {activeTransaction.amount} · {activeTransaction.environment}
              </span>
            </div>
          </div>
          {['stripe', 'bkash'].includes(activeTransaction.paymentMethod) ? (
            activeTransaction.checkoutUrl ? (
              <div className="payment-simulate-actions">
                <a className="btn btn-primary btn-sm" href={activeTransaction.checkoutUrl}>
                  Resume {METHOD_LABELS[activeTransaction.paymentMethod]} checkout
                </a>
                <span className="payment-panel-note">
                  Complete the payment with the provider. This panel updates after server-side verification.
                </span>
              </div>
            ) : (
              <p className="payment-panel-note">
                Waiting for provider confirmation. This panel updates after the verified callback arrives.
              </p>
            )
          ) : activeTransaction.paymentMethod === 'pay_at_salon' ? (
            <p className="payment-panel-note">
              Pay at Salon is waiting for admin cash confirmation. It is not marked received
              automatically.
            </p>
          ) : activeTransaction.simulated ? (
            <div className="payment-simulate-actions">
              <span className="payment-panel-note">Simulate TEST outcome:</span>
              <Button size="sm" variant="primary" loading={busy} onClick={() => simulate('success')}>
                Success
              </Button>
              <Button size="sm" variant="outline" loading={busy} onClick={() => simulate('failed')}>
                Failed
              </Button>
              <Button size="sm" variant="danger" loading={busy} onClick={() => simulate('cancelled')}>
                Cancelled
              </Button>
            </div>
          ) : (
            <p className="payment-panel-note">
              This payment is waiting for provider confirmation and cannot be simulated.
            </p>
          )}
        </div>
      ) : (
        <div className="payment-method-list" role="group" aria-label="Payment methods">
          <p className="payment-panel-note">
            {!methods?.enabled
              ? 'No payment methods are currently available. Unavailable options are shown disabled below.'
              : hasStripe
                ? 'Stripe card payments run in Stripe TEST mode. Demo methods remain simulated and no real money is charged.'
                : 'Demo methods are simulated TEST payments. The amount is a configured demo amount in BDT, not the service display price.'}
          </p>
          {methodOptions.map((method) => (
            <button
              key={method.id}
              type="button"
              className="payment-method"
              disabled={busy || !method.available}
              onClick={() => chooseMethod(method)}
            >
              <span>
                <strong>{method.label}</strong>
                <small>{methodHint(method)}</small>
              </span>
              <span className="payment-method-amount">{methodAmountLabel(method)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
