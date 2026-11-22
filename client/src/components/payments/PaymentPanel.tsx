import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import {
  createPaymentSession,
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
  stripe_demo: 'Stripe Demo',
  bkash_demo: 'bKash Demo',
  nagad_demo: 'Nagad Demo',
  pay_at_salon: 'Pay at Salon Demo',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Payment pending',
  processing: 'Processing',
  succeeded: 'Paid',
  cash_pending: 'Pay at salon',
  cash_received: 'Cash received',
  failed: 'Failed',
  cancelled: 'Cancelled',
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
    if (busy || activeTransaction) return
    setBusy(true)
    setError(null)
    try {
      const result = await createPaymentSession(appointment.id, method.id)
      setTransaction(result.transaction)
      onChanged()
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to start TEST payment.'))
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

  return (
    <div className="payment-panel">
      <div className="payment-panel-head">
        <div>
          <span className="payment-panel-eyebrow">TEST payment</span>
          <h3>{appointment.serviceTitle}</h3>
          <p>
            {formatShortDate(appointment.date)} · {appointment.time} · Display price{' '}
            {appointment.price ?? '—'} · Demo amount {amountLabel}
          </p>
        </div>
        <button type="button" className="payment-panel-close" onClick={onClose} aria-label="Close payment panel">
          <Icon name="x" size={18} />
        </button>
      </div>

      {loading ? (
        <p className="payment-panel-note">Loading TEST payment options…</p>
      ) : error ? (
        <p className="payment-panel-error">{error}</p>
      ) : !methods?.enabled ? (
        <p className="payment-panel-note">
          TEST payments are disabled. Set PAYMENT_ENV=TEST, PAYMENT_SIMULATOR_ENABLED=true and
          PAYMENT_TEST_DEMO_AMOUNT_BDT in a non-production environment.
        </p>
      ) : settledTransaction ? (
        <div className="payment-result payment-result-success">
          <Icon name="check" size={18} />
          <div>
            <strong>{STATUS_LABELS[settledTransaction.paymentStatus] ?? 'Paid'}</strong>
            <span>
              {METHOD_LABELS[settledTransaction.paymentMethod]} · BDT {settledTransaction.amount} · TEST
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
                {METHOD_LABELS[activeTransaction.paymentMethod]} · BDT {activeTransaction.amount} · TEST
              </span>
            </div>
          </div>
          {activeTransaction.paymentMethod === 'pay_at_salon' ? (
            <p className="payment-panel-note">
              Pay at Salon Demo is waiting for admin cash confirmation. It is not marked received
              automatically.
            </p>
          ) : (
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
          )}
        </div>
      ) : (
        <div className="payment-method-list" role="group" aria-label="TEST payment methods">
          <p className="payment-panel-note">
            All methods are simulated TEST payments. The amount is a configured demo amount in BDT,
            not the service display price.
          </p>
          {methods.methods.map((method) => (
            <button
              key={method.id}
              type="button"
              className="payment-method"
              disabled={busy}
              onClick={() => chooseMethod(method)}
            >
              <span>
                <strong>{method.label}</strong>
                <small>{method.requiresSimulation ? 'Simulated gateway' : 'Salon cash demo'}</small>
              </span>
              <span className="payment-method-amount">{amountLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
