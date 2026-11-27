import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import Icon, { type IconName } from '@/components/common/Icon'
import ServiceImage from '@/components/services/ServiceImage'
import {
  createBkashCheckoutSession,
  createPaymentSession,
  createStripeCheckoutSession,
  fetchAppointmentPayment,
  fetchPaymentMethods,
  simulatePaymentOutcome,
} from '@/services/api/payments'
import { fetchServiceById } from '@/services/api/services'
import type {
  Appointment,
  PaymentMethod,
  PaymentMethodsResponse,
  PaymentMethodId,
  PaymentSimulationOutcome,
  PaymentTransaction,
  ServiceItem,
} from '@/types'
import { getErrorMessage } from '@/utils/errors'
import { formatShortDate } from '@/utils/format'

interface PaymentPanelProps {
  appointment: Appointment
  onClose: () => void
  onChanged: () => void
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

const METHOD_CARD_LABELS: Record<PaymentMethodId, string> = {
  stripe: 'Card Payment',
  bkash: 'bKash',
  nagad: 'Nagad',
  stripe_demo: 'Card Payment',
  bkash_demo: 'bKash',
  nagad_demo: 'Nagad',
  pay_at_salon: 'Pay at Salon',
}

function isActive(transaction: PaymentTransaction | null): boolean {
  return Boolean(
    transaction &&
      ['pending', 'processing', 'cash_pending'].includes(transaction.paymentStatus)
  )
}

function methodDisplayName(methodId: PaymentMethodId, simulated = false): string {
  const base = METHOD_CARD_LABELS[methodId]
  return simulated ? `${base} · Test` : base
}

const CHECKOUT_METHODS: Array<{
  key: 'card' | 'bkash' | 'nagad'
  methodIds: PaymentMethodId[]
  label: string
  subtitle: string
  icon: IconName
}> = [
  {
    key: 'card',
    methodIds: ['stripe', 'stripe_demo'],
    label: 'Card Payment',
    subtitle: 'Visa / Mastercard',
    icon: 'chart',
  },
  {
    key: 'bkash',
    methodIds: ['bkash', 'bkash_demo'],
    label: 'bKash',
    subtitle: 'Mobile payment',
    icon: 'phone',
  },
  {
    key: 'nagad',
    methodIds: ['nagad', 'nagad_demo'],
    label: 'Nagad',
    subtitle: 'Mobile payment',
    icon: 'shield',
  },
]

type DemoFieldKey = 'cardNumber' | 'expiry' | 'cvc' | 'cardholder' | 'mobileNumber' | 'pin'
type DemoFields = Record<DemoFieldKey, string>
type DemoFieldErrors = Partial<Record<DemoFieldKey, string>>

const EMPTY_DEMO_FIELDS: DemoFields = {
  cardNumber: '',
  expiry: '',
  cvc: '',
  cardholder: '',
  mobileNumber: '',
  pin: '',
}

function isCardDemo(method: PaymentMethod): boolean {
  return method.id === 'stripe' || method.id === 'stripe_demo'
}

function isMobileDemo(method: PaymentMethod): boolean {
  return method.id === 'bkash' || method.id === 'bkash_demo' || method.id === 'nagad' || method.id === 'nagad_demo'
}

function demoFieldErrors(method: PaymentMethod, fields: DemoFields): DemoFieldErrors {
  const errors: DemoFieldErrors = {}
  if (isCardDemo(method)) {
    if (fields.cardNumber.replace(/\D/g, '').length !== 16) errors.cardNumber = 'Enter a 16-digit demo card number.'
    if (!/^\d{2}\/\d{2}$/.test(fields.expiry.trim())) errors.expiry = 'Use MM/YY.'
    if (!/^\d{3}$/.test(fields.cvc.trim())) errors.cvc = 'Enter a 3-digit demo CVC.'
    if (fields.cardholder.trim().length < 2) errors.cardholder = 'Enter the name on the demo card.'
  }
  if (isMobileDemo(method)) {
    const mobile = fields.mobileNumber.replace(/\D/g, '')
    if (mobile.length !== 11 || !mobile.startsWith('01')) errors.mobileNumber = 'Enter an 11-digit demo mobile number.'
    if (!/^\d{4,6}$/.test(fields.pin.trim())) errors.pin = 'Enter a 4–6 digit demo PIN.'
  }
  return errors
}

export default function PaymentPanel({ appointment, onClose, onChanged }: PaymentPanelProps) {
  const [methods, setMethods] = useState<PaymentMethodsResponse | null>(null)
  const [service, setService] = useState<ServiceItem | null>(null)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [paymentStatus, setPaymentStatus] = useState(appointment.paymentStatus ?? 'unpaid')
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId | null>(null)
  const [demoFields, setDemoFields] = useState<DemoFields>(EMPTY_DEMO_FIELDS)
  const [demoErrors, setDemoErrors] = useState<DemoFieldErrors>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [methodsPayload, paymentState, serviceItem] = await Promise.all([
          fetchPaymentMethods(),
          fetchAppointmentPayment(appointment.id),
          fetchServiceById(appointment.serviceId).catch(() => null),
        ])
        if (cancelled) return
        setMethods(methodsPayload)
        setService(serviceItem)
        setTransaction(paymentState.transaction)
        setPaymentStatus(paymentState.payment.status)
      } catch (caught) {
        if (!cancelled) setError(getErrorMessage(caught, 'Unable to load payment options.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [appointment.id, appointment.serviceId])

  const activeTransaction = useMemo(() => (isActive(transaction) ? transaction : null), [transaction])
  const settledTransaction = useMemo(
    () =>
      transaction && ['succeeded', 'cash_received'].includes(transaction.paymentStatus)
        ? transaction
        : null,
    [transaction]
  )
  const methodOptions = useMemo(() => methods?.methods ?? [], [methods])
  const checkoutMethods = useMemo(
    () =>
      CHECKOUT_METHODS.map((option) => {
        const candidates = option.methodIds
          .map((id) => methodOptions.find((method) => method.id === id))
          .filter((method): method is PaymentMethod => Boolean(method))
        const method = candidates.find((candidate) => candidate.available) ?? candidates[0] ?? null
        return {
          ...option,
          method,
          available: method?.available === true,
        }
      }),
    [methodOptions]
  )
  const selectedMethod = useMemo(
    () =>
      checkoutMethods
        .map((option) => option.method)
        .find((method) => method?.id === selectedMethodId) ?? null,
    [checkoutMethods, selectedMethodId]
  )
  const hasAvailableMethods = useMemo(
    () => checkoutMethods.some((option) => option.available),
    [checkoutMethods]
  )
  const checkoutIsTest = useMemo(
    () => checkoutMethods.some((option) => option.available && option.method?.simulated),
    [checkoutMethods]
  )
  const payable = appointment.status === 'confirmed' && paymentStatus !== 'paid'

  async function chooseMethod(method: PaymentMethod) {
    if (busy || activeTransaction || !method.available || !payable) return
    if (method.id === 'nagad' && method.mode === 'real') {
      setError('Nagad checkout is not available yet.')
      return
    }
    if (method.simulated) {
      const errors = demoFieldErrors(method, demoFields)
      setDemoErrors(errors)
      if (Object.keys(errors).length > 0) {
        setError('Please complete the required demo payment fields.')
        return
      }
    }
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
        if (method.simulated) {
          const settled = await simulatePaymentOutcome(result.transaction.id, 'success')
          setTransaction(settled.transaction)
          setPaymentStatus(settled.appointment?.paymentStatus ?? 'paid')
        } else {
          setTransaction(result.transaction)
        }
      }
      onChanged()
    } catch (caught) {
      setError(getErrorMessage(caught, 'Unable to start payment.'))
    } finally {
      setBusy(false)
    }
  }

  function updateDemoField(key: DemoFieldKey, value: string) {
    setDemoFields((current) => ({ ...current, [key]: value }))
    setDemoErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
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
      setError(getErrorMessage(caught, 'Unable to update the test payment.'))
    } finally {
      setBusy(false)
    }
  }

  function methodAmountLabel(method: PaymentMethod): string {
    const currency = method.currency || 'BDT'
    if (method.mode === 'real' || method.id === 'pay_at_salon') {
      return appointment.priceAmount ? `${currency} ${appointment.priceAmount}` : 'At checkout'
    }
    return methods?.amount != null ? `${currency} ${methods.amount}` : 'Test amount'
  }

  function methodHint(method: PaymentMethod): string {
    if (!method.available) return 'Not configured'
    if (method.simulated) return 'TEST — simulated, no real money is charged'
    if (method.id === 'stripe') return 'Visa / Mastercard / Stripe'
    if (method.id === 'bkash') return 'Pay with bKash'
    if (method.id === 'nagad') return 'Pay with Nagad'
    return 'Secure checkout'
  }

  const bookingAmount = appointment.priceAmount
    ? `BDT ${appointment.priceAmount}`
    : appointment.price ?? '—'
  const totalAmount = transaction?.amount
    ? `${transaction.currency || 'BDT'} ${transaction.amount}`
    : selectedMethod
      ? methodAmountLabel(selectedMethod)
      : 'Select a method'

  return (
    <div className="payment-panel">
      <div className="payment-panel-head">
        <div>
          <span className="payment-panel-eyebrow">Secure checkout</span>
          <h3>Complete your payment</h3>
          <p>Review your booking and choose a payment method.</p>
        </div>
        <button type="button" className="payment-panel-close" onClick={onClose} aria-label="Close payment panel">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="payment-layout">
        <section className="payment-summary-card" aria-label="Booking summary">
          <div className="payment-summary-media">
            <ServiceImage src={service?.image} title={service?.title ?? appointment.serviceTitle} />
          </div>
          <div className="payment-summary-body">
            <span className="payment-panel-eyebrow">Booking summary</span>
            <h4>{service?.title ?? appointment.serviceTitle}</h4>
            <p>{service?.description ?? appointment.serviceTitle}</p>
            <dl className="payment-summary-facts">
              <div>
                <dt>Date</dt>
                <dd>{formatShortDate(appointment.date)}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{appointment.time}</dd>
              </div>
              <div>
                <dt>Booking amount</dt>
                <dd>{bookingAmount}</dd>
              </div>
              <div>
                <dt>Total amount</dt>
                <dd>{totalAmount}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="payment-method-card" aria-label="Payment method">
          {loading ? (
            <p className="payment-panel-note">Loading payment options…</p>
          ) : error ? (
            <p className="payment-panel-error">{error}</p>
          ) : !payable ? (
            <div className="payment-result">
              <Icon name="lock" size={18} />
              <div>
                <strong>Payment unavailable</strong>
                <span>Only confirmed, unpaid appointments can be paid.</span>
              </div>
            </div>
          ) : settledTransaction ? (
            settledTransaction.simulated ? (
              <div className="payment-success-screen">
                <div className="payment-success-badge">
                  <Icon name="check" size={22} />
                  <span>Demo payment completed</span>
                </div>
                <h4>Payment Successful</h4>
                <p>Demo payment completed successfully. No real money was charged.</p>
                <dl className="payment-reference-list">
                  <div>
                    <dt>Transaction reference</dt>
                    <dd>{settledTransaction.providerReference ?? settledTransaction.id}</dd>
                  </div>
                  <div>
                    <dt>Booking reference</dt>
                    <dd>{appointment.id}</dd>
                  </div>
                  <div>
                    <dt>Payment method</dt>
                    <dd>{methodDisplayName(settledTransaction.paymentMethod, settledTransaction.simulated)}</dd>
                  </div>
                  <div>
                    <dt>Amount</dt>
                    <dd>{settledTransaction.currency} {settledTransaction.amount}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>TEST / DEMO</dd>
                  </div>
                </dl>
                <p className="payment-panel-note payment-panel-fineprint">
                  This was a simulated transaction only; it is not a real Stripe, bKash, or Nagad payment.
                </p>
              </div>
            ) : (
              <div className="payment-result payment-result-success">
                <Icon name="check" size={18} />
                <div>
                  <strong>{STATUS_LABELS[settledTransaction.paymentStatus] ?? 'Paid'}</strong>
                  <span>
                    {methodDisplayName(settledTransaction.paymentMethod, settledTransaction.simulated)} · {settledTransaction.currency} {settledTransaction.amount}
                  </span>
                </div>
              </div>
            )
          ) : activeTransaction ? (
            <div className="payment-active">
              <div className="payment-result">
                <Icon name="clock" size={18} />
                <div>
                  <strong>{STATUS_LABELS[activeTransaction.paymentStatus] ?? 'Payment pending'}</strong>
                  <span>
                    {methodDisplayName(activeTransaction.paymentMethod, activeTransaction.simulated)} · BDT {activeTransaction.amount}
                  </span>
                </div>
              </div>
              {['stripe', 'bkash'].includes(activeTransaction.paymentMethod) ? (
                activeTransaction.checkoutUrl ? (
                  <div className="payment-simulate-actions">
                    <a className="btn btn-primary btn-sm" href={activeTransaction.checkoutUrl}>
                      Resume {methodDisplayName(activeTransaction.paymentMethod, activeTransaction.simulated)} checkout
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
                  Pay at Salon is waiting for admin cash confirmation. It is not marked received automatically.
                </p>
              ) : activeTransaction.simulated ? (
                <div className="payment-simulate-actions">
                  <span className="payment-panel-note">Test payment controls:</span>
                  <Button size="sm" variant="primary" loading={busy} onClick={() => simulate('success')}>
                    Complete test
                  </Button>
                  <Button size="sm" variant="outline" loading={busy} onClick={() => simulate('failed')}>
                    Fail test
                  </Button>
                  <Button size="sm" variant="danger" loading={busy} onClick={() => simulate('cancelled')}>
                    Cancel test
                  </Button>
                </div>
              ) : (
                <p className="payment-panel-note">
                  This payment is waiting for provider confirmation and cannot be completed manually.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="payment-method-list" role="group" aria-label="Payment methods">
                {checkoutMethods.map((option) => {
                  const method = option.method
                  const selected = method?.id === selectedMethodId
                  const available = option.available && Boolean(method)
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`payment-method${selected ? ' is-selected' : ''}`}
                      disabled={busy || !available}
                      onClick={() => {
                        if (method) {
                          setSelectedMethodId(method.id)
                          setDemoErrors({})
                        }
                      }}
                      aria-pressed={selected}
                    >
                      <span className="payment-method-main">
                        <span className="payment-method-icon" aria-hidden="true">
                          <Icon name={option.icon} size={17} />
                        </span>
                        <span>
                          <strong>{option.label}</strong>
                          <small>{method ? methodHint(method) : 'Not configured'}</small>
                        </span>
                      </span>
                      <span className="payment-method-side">
                        <span className="payment-method-amount">
                          {available && method ? methodAmountLabel(method) : 'Not configured'}
                        </span>
                        <span className={`payment-method-check${selected ? ' is-selected' : ''}`} aria-hidden="true">
                          <Icon name="check" size={13} />
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedMethod?.simulated && (
                <div className="payment-demo-fields" aria-label="Demo payment details">
                  <div className="payment-demo-note">
                    <Icon name="shield" size={14} />
                    <span>Demo fields only — do not enter real card, PIN, OTP, or banking credentials.</span>
                  </div>
                  {isCardDemo(selectedMethod) ? (
                    <>
                      <label className={`form-group${demoErrors.cardNumber ? ' form-group-error' : ''}`}>
                        <span className="form-label">Demo card number</span>
                        <input
                          className="form-input"
                          value={demoFields.cardNumber}
                          onChange={(event) => updateDemoField('cardNumber', event.target.value)}
                          placeholder="0000 0000 0000 0000"
                          inputMode="numeric"
                          autoComplete="off"
                        />
                        {demoErrors.cardNumber && <small className="form-error">{demoErrors.cardNumber}</small>}
                      </label>
                      <div className="payment-demo-grid">
                        <label className={`form-group${demoErrors.expiry ? ' form-group-error' : ''}`}>
                          <span className="form-label">Expiry</span>
                          <input
                            className="form-input"
                            value={demoFields.expiry}
                            onChange={(event) => updateDemoField('expiry', event.target.value)}
                            placeholder="MM/YY"
                            inputMode="numeric"
                            autoComplete="off"
                          />
                          {demoErrors.expiry && <small className="form-error">{demoErrors.expiry}</small>}
                        </label>
                        <label className={`form-group${demoErrors.cvc ? ' form-group-error' : ''}`}>
                          <span className="form-label">CVC</span>
                          <input
                            className="form-input"
                            value={demoFields.cvc}
                            onChange={(event) => updateDemoField('cvc', event.target.value)}
                            placeholder="123"
                            inputMode="numeric"
                            autoComplete="off"
                          />
                          {demoErrors.cvc && <small className="form-error">{demoErrors.cvc}</small>}
                        </label>
                      </div>
                      <label className={`form-group${demoErrors.cardholder ? ' form-group-error' : ''}`}>
                        <span className="form-label">Name on card</span>
                        <input
                          className="form-input"
                          value={demoFields.cardholder}
                          onChange={(event) => updateDemoField('cardholder', event.target.value)}
                          placeholder="Demo User"
                          autoComplete="off"
                        />
                        {demoErrors.cardholder && <small className="form-error">{demoErrors.cardholder}</small>}
                      </label>
                    </>
                  ) : isMobileDemo(selectedMethod) ? (
                    <>
                      <label className={`form-group${demoErrors.mobileNumber ? ' form-group-error' : ''}`}>
                        <span className="form-label">Demo mobile number</span>
                        <input
                          className="form-input"
                          value={demoFields.mobileNumber}
                          onChange={(event) => updateDemoField('mobileNumber', event.target.value)}
                          placeholder="01XXXXXXXXX"
                          inputMode="tel"
                          autoComplete="off"
                        />
                        {demoErrors.mobileNumber && <small className="form-error">{demoErrors.mobileNumber}</small>}
                      </label>
                      <label className={`form-group${demoErrors.pin ? ' form-group-error' : ''}`}>
                        <span className="form-label">Demo PIN</span>
                        <input
                          className="form-input"
                          value={demoFields.pin}
                          onChange={(event) => updateDemoField('pin', event.target.value)}
                          placeholder="Demo PIN"
                          inputMode="numeric"
                          autoComplete="off"
                        />
                        {demoErrors.pin && <small className="form-error">{demoErrors.pin}</small>}
                      </label>
                    </>
                  ) : null}
                </div>
              )}
              <button
                type="button"
                className="payment-pay-button"
                disabled={busy || !hasAvailableMethods || !selectedMethod || !selectedMethod.available}
                onClick={() => selectedMethod && void chooseMethod(selectedMethod)}
              >
                {busy
                  ? 'Processing…'
                  : !hasAvailableMethods
                    ? 'No payment methods available'
                    : selectedMethod
                      ? `Pay ${totalAmount}`
                      : 'Select a payment method'}
              </button>
              {!hasAvailableMethods && (
                <p className="payment-panel-note payment-panel-fineprint">
                  Payment methods are currently unavailable. Please try again later or contact the salon.
                </p>
              )}
              {checkoutIsTest && (
                <p className="payment-panel-note payment-panel-fineprint">
                  TEST checkout: payments are simulated and no real money is charged.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
